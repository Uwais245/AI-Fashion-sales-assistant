"""
main.py — Customer support chatbot agent.

Wires the Gemini LLM together with the support tools:
    search_policy, get_customer_profile, get_order_details, search_products,
    check_product_availability, recommend_products
classify_message is called directly on every turn (see main()) rather than
left as an agent-optional tool.

Run:
    python main.py

Requires in .env:
    GOOGLE_API_KEY=...
    BASE_URL_BACKEND=http://localhost:5000/api   (or COMPANY_API_BASE_URL)
"""

import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

# NOTE: adjust this import to match whatever your tools file is actually named
# (e.g. `from tools import ...` if your file is tools.py)
from tools import (
    get_customer_profile,
    get_order_details,
    search_products,
    check_product_availability,
    recommend_products,
    _get,  # reused here just for the phone -> customer_id lookup at login
)
from classifier import classify_message
from rag import search_policy

load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """You are a helpful, friendly customer support assistant for an online clothing store.

You have access to tools for:
- search_policy: look up store policy (returns, shipping, payment, etc.) — always check this rather than guessing policy details
- get_customer_profile: look up the current customer's own profile (you already know who they are from context — never ask them for their customer ID)
- get_order_details: look up one of the current customer's orders, or all of them if no order ID is given
- search_products: browse/search the catalog by free text or filters (including cheapest-first and discounted-only)
- check_product_availability: check stock for a specific known product (only after it's been identified via search_products or an order)
- recommend_products: suggest products based on the customer's saved preferences, for when they ask what you'd suggest rather than giving explicit criteria

Rules:
- Never invent order, product, stock, or policy details. If you need a fact, call the relevant tool.
- Before calling any tool to first get the relevent data for that. ie if a person says i want to buy a suit for eid.
    check if you know the gender of person and the preferences.
    then ask him/her about all the things that would make it easier ot search. like dont over question him/her but do ask the bare minimum.
- The customer is already authenticated — you have their customer_id in context. Never ask them for it.
- If the customer asks about size, color, or availability without naming a product, use whichever product was most recently discussed in this conversation instead of asking them to repeat it — only ask which product they mean if none has come up yet.
- Each customer message arrives tagged with its detected intent and sentiment, e.g. "[intent=Complaint, sentiment=Negative] ...". Use that to shape your tone (e.g. extra patience and a clear next step for a frustrated or angry customer) — never repeat the tag back to the customer.
- If a tool returns an error, tell the customer clearly and helpfully what went wrong; don't make something up.
- Keep responses concise and friendly, like a real support agent chatting with a customer.
"""


def build_agent():
    """
    Uses langchain.agents.create_agent (LangGraph-based) instead of the legacy
    AgentExecutor/create_tool_calling_agent. The legacy AgentExecutor calls
    tool.run(...) without forwarding `config`, so tools that read
    config["configurable"]["customer_id"] (e.g. get_customer_profile) got
    config=None and crashed. create_agent's ToolNode calls tool.invoke(args, config),
    which correctly threads `configurable` down to every tool call.
    """
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )

    tools = [
        search_policy,
        get_customer_profile,
        get_order_details,
        search_products,
        check_product_availability,
        recommend_products,
    ]

    return create_agent(model=llm, tools=tools, system_prompt=SYSTEM_PROMPT)


def resolve_customer(phone: str) -> dict | None:
    """Look up a customer's Mongo _id/name by phone number (raw request — no tool covers this)."""
    lookup = _get("/customers/lookup", params={"phone": phone})
    print("Lookup result: ", lookup)
    if isinstance(lookup, dict) and "error" not in lookup and lookup.get("_id"):
        return lookup
    return None


def tag_message(user_input: str) -> str:
    """Prefix the message with its detected intent/sentiment so the model
    doesn't have to decide on its own whether to classify each turn."""
    classification = classify_message.invoke({"message": user_input})
    return f"[intent={classification.intent}, sentiment={classification.sentiment}] {user_input}"


def extract_text(content) -> str:
    """
    Gemini can return message content as a list of blocks (e.g. with an
    internal tool-calling 'thought signature' attached) instead of a plain
    string. This guards against that format leaking through.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return str(content)


def main() -> None:
    print("=== Customer Support Chatbot ===")
    phone = input("Enter your phone number to sign in: ").strip()

    customer = resolve_customer(phone)
    if not customer:
        print("Sorry, we couldn't find an account with that phone number. Exiting.")
        return

    config = {"configurable": {"customer_id": customer["_id"]}}
    agent = build_agent()

    messages: list = []
    print(f"\nBot: Hi {customer.get('name', 'there')}, welcome to FashionHub! "
          f"Looking for something new, checking on an order, or have a question "
          f"about delivery or returns — I'm happy to help either way.\n")
    print("Type 'exit' or 'quit' to end the chat.\n")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("Bot: Thanks for chatting with us — have a great day!")
            break

        messages.append(HumanMessage(content=tag_message(user_input)))

        try:
            result = agent.invoke({"messages": messages}, config=config)
        except Exception as e:
            print(f"Bot: Sorry, something went wrong on my end ({e}). Could you try again?\n")
            messages.pop()  # drop the message we couldn't get a response to
            continue

        messages = result["messages"]
        response = extract_text(messages[-1].content)
        print(f"Bot: {response}\n")


if __name__ == "__main__":
    main()