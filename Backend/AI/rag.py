import doctest
import os
from pathlib import Path

from langchain_classic.storage import create_kv_docstore, LocalFileStore
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv
from langchain_core.tools import tool
from pathlib import Path
import hashlib
from langchain_classic.retrievers import ParentDocumentRetriever
import json
import os

from pydantic import BaseModel, Field

load_dotenv()
REGISTRY_FILE = "registry.json"
POLICIES_DIR = Path(r"policies")
CHROMA_DIR = Path(r"chroma")
COLLECTION_NAME = "clothing_brand_polices"

# --- Parent-child specific paths (SEPARATE from your main store above) ---
PC_CHROMA_DIR = Path(r"chroma_pc")            # child embeddings live here
PC_DOCSTORE_DIR = Path(r"parent_docstore")    # parent docs live here
PC_COLLECTION_NAME = "clothing_brand_polices_pc"


LOADER_MAP = {
    ".txt": lambda path: TextLoader(path, encoding="utf-8"),
    ".pdf": lambda path: PyPDFLoader(path),
    ".docx": lambda path: Docx2txtLoader(path),
}

READ_EXTENSIONS = LOADER_MAP.keys()


def chunk_docs(docs):
    # Data would be in a continues format ie the data would not be chunked rather it would be
    """Split docs into chunks. Paragraph-aware since our docs use blank-line sections."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # bigger, so a whole subsection fits
        chunk_overlap=100,
        separators=[
            "\nSECTION ",  # top-level sections first
            "\n\n",  # then paragraph breaks
            "\n",
            ". ",
            " ",
            "",
        ],
    )
    return splitter.split_documents(docs)


# ------------Hashing

def get_file_hash(file_path: str, chunk_size: int = 8192) -> str:
    # sha256()
    hasher = hashlib.sha256()

    with open(file_path, 'rb') as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)

    return hasher.hexdigest()

def get_registry():
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "r") as f:
            return json.load(f)
    return {}

def update_registry(registry):
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=4)

def should_process_file(file_path):
    registry = get_registry()
    current_hash = get_file_hash(file_path)

    # Check if file has changed
    if registry.get(str(file_path)) == current_hash:
        return False, current_hash  # No change needed
    return True, current_hash  # Needs update

def build_vectorstore():

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

    store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_DIR),

    )

    registry = get_registry()
    seen_paths = set()
    new_docs = []
    skipped = []

    for file_path in POLICIES_DIR.rglob("*"):
        if not file_path.is_file():
            continue
        ext = file_path.suffix
        if ext not in READ_EXTENSIONS:
            skipped.append((file_path, "Ext of file not supported"))
            continue

        path_str = str(file_path)
        seen_paths.add(path_str)
        needs_update, current_hash = should_process_file(file_path)
        if not needs_update:
            skipped.append((file_path, "File already processed"))
            continue

        # File is new OR changed. If it was seen before (changed), purge old chunks first.
        if path_str in registry:
            store.delete(where={"source_path": path_str})
            print(f"Removed stale chunks for changed file: {file_path.name}")

        loaded = LOADER_MAP[ext](path_str).load()
        for d in loaded:
            d.metadata["source_path"] = path_str
            d.metadata["filename"] = file_path.name
        new_docs.extend(loaded)
        registry[path_str] = current_hash

    # Step 3: handle DELETED files — in registry but no longer on disk.
    deleted_paths = set(registry.keys()) - seen_paths
    for path_str in deleted_paths:
        store.delete(where={"source_path": path_str})
        del registry[path_str]
        print(f"Removed chunks for deleted file: {path_str}")

    if new_docs:
        chunks = chunk_docs(new_docs)
        store.add_documents(chunks)
        print(f"Embedded {len(chunks)} new/changed chunks.")

    update_registry(registry)
    return store


# =====================================================================
#  PARENT-CHILD PIPELINE (separate experiment, own directories)
# =====================================================================
# ---------- helper: load raw docs (shared by both pipelines) ----------
# def load_raw_docs():
#     """Load every supported file as raw Documents (no chunking).
#     Used by the parent-child pipeline, which chunks internally."""
#     docs = []
#     for file_path in POLICIES_DIR.rglob("*"):
#         if not file_path.is_file():
#             continue
#         ext = file_path.suffix
#         if ext not in READ_EXTENSIONS:
#             continue
#         path_str = str(file_path)
#         loaded = LOADER_MAP[ext](path_str).load()
#         for d in loaded:
#             d.metadata["source_path"] = path_str
#             d.metadata["filename"] = file_path.name
#         docs.extend(loaded)
#     return docs



# def build_parent_child_retriever(force_rebuild: bool = False):
#     """
#     Build a ParentDocumentRetriever.
#     - Child chunks (small) are embedded into a SEPARATE Chroma collection (PC_CHROMA_DIR).
#     - Parent chunks (large) are stored in a persistent file-backed docstore (PC_DOCSTORE_DIR).
#     This does NOT touch your main store above. It uses load_raw_docs() and lets the
#     retriever do the chunking internally, so chunk_docs() is bypassed for this path.
#
#     Caching note: this uses the simple "rebuild both stores when needed" strategy
#     (Option A). It does NOT integrate with the hash registry, because keeping two
#     stores + parent/child ID links in sync incrementally is a separate rabbit hole.
#     To re-index after changing docs, pass force_rebuild=True (or delete PC_CHROMA_DIR
#     and PC_DOCSTORE_DIR).
#     """
#     embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
#
#     # Child: small, precise chunks that get embedded and searched.
#     child_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=500,  # bigger, so a whole subsection fits
#         chunk_overlap=70,
#         separators=[
#             "\nSECTION ",  # top-level sections first
#             "\n\n",  # then paragraph breaks
#             "\n",
#             ". ",
#             " ",
#             "",
#         ],
#     )
#     # Parent: larger chunks returned for context (whole subsection-ish).
#     parent_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=2000,  # bigger, so a whole subsection fits
#         chunk_overlap=200,
#         separators=[
#             "\nSECTION ",  # top-level sections first
#             "\n\n",  # then paragraph breaks
#             "\n",
#             ". ",
#             " ",
#             "",
#         ],
#     )
#
#     # Vector store for CHILD chunks (embedded).
#     pc_vectorstore = Chroma(
#         collection_name=PC_COLLECTION_NAME,
#         embedding_function=embeddings,
#         persist_directory=str(PC_CHROMA_DIR),
#     )
#
#     # Persistent docstore for PARENT docs (NOT embedded, keyed by id).
#     # LocalFileStore + create_kv_docstore makes parents survive between runs,
#     # unlike InMemoryStore which loses them on exit.
#     fs = LocalFileStore(str(PC_DOCSTORE_DIR))
#     docstore = create_kv_docstore(fs)
#
#     retriever = ParentDocumentRetriever(
#         vectorstore=pc_vectorstore,
#         docstore=docstore,
#         child_splitter=child_splitter,
#         parent_splitter=parent_splitter,
#         search_kwargs={"k": 3},  # bump to 20 later when you add re-ranking
#     )
#
#     # Only add documents if the store looks empty or a rebuild is forced.
#     # (add_documents re-splits and re-embeds, so we avoid doing it every run.)
#     already_populated = pc_vectorstore._collection.count() > 0
#     if force_rebuild or not already_populated:
#         raw_docs = load_raw_docs()
#         retriever.add_documents(raw_docs)
#         print(f"[parent-child] Indexed {len(raw_docs)} raw docs "
#               f"(child chunks embedded, parents stored).")
#     else:
#         print("[parent-child] Existing stores found — skipping re-index.")
#
#     return retriever

vector_store = build_vectorstore()
# retriever_ = vector_store.as_retriever(search_kwargs={"k":3})

# retriever_ = vector_store.as_retriever(
#     search_type="similarity",
#     search_kwargs={"k": 3}
# )

retriever_ = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 3,
        "fetch_k": 10  # Evaluates the top 10 semantic matches first, then picks the 3 most diverse ones
    }
)

# retriever_ = vector_store.as_retriever(
#     search_type="similarity_score_threshold",
#     search_kwargs={
#         "k": 3,
#         "score_threshold": 0.5  # Only return documents with a 70%+ match confidence
#     }
# )

# retriever_ = build_parent_child_retriever(force_rebuild=False)



class PolicyQuery(BaseModel):
    query: str = Field(
        description="The specific Query to find in the documentation."
    )


@tool("SearchPolicy", args_schema=PolicyQuery)
def search_policy(query: str):
    """It searches the Vector store for the policy and returns the top 3 Results
    :param query
    """
    results = retriever_.invoke(query)
    if not results:
        return "No relevant policy information found."
    return "\n\n---\n\n".join(doc.page_content + "\nReference: " + doc.metadata["filename"] for doc in results)


if __name__ ==  "__main__":
    test_queries = [
        "I bought a swimsuit on Eid sale, can I return it?",
        "return policy"
    ]

    for q in test_queries:
        print("Query: ", q)
        print("Result: ", search_policy.invoke({"query": q}))

    print ("end")

