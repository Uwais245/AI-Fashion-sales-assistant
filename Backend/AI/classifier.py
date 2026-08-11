import yaml
from pydantic import BaseModel, Field
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

INTENT_OPT = ["Greeting", "Product Search", "Order Placement", "Delivery Inquiry",
              "Complaint", "Return Request", "Discount Inquiry"]

# Field key helps to add metadata info to attributes, i could attach like the intent/discription, bounds, checks etc
class SentimentClassifier(BaseModel):
    intent: str = Field(description="The intent of the user behind the msg. Must be exactly one of: " + ", ".join(INTENT_OPT))
    sentiment: str = Field(description="The emotional tone of the message. Must be exactly 'Positive', 'Neutral', or 'Negative'.")
    confidence: float = Field(description="The confidence of the sentiment. Must be between 0 and 1.")
    reasoning: str = Field(description="The reasoning behind it.")



@tool
def classify_message(message: str) -> SentimentClassifier:
    """It is used to check the sentiment of the message
    earlier check for the model to know the sentiment when answering queries

    :param message: The message to classify
    """
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0)
    structured_analyzer = llm.with_structured_output(SentimentClassifier)
    prompt = f"Analyze the following customer support message: \n\n\"{message}\""
    return structured_analyzer.invoke(prompt)



















