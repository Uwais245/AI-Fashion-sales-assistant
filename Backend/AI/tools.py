from typing import Annotated
import requests
import os
from langchain.tools import tool
from langchain_community.llms.aviary import TIMEOUT
from pydantic import BaseModel, Field

from langchain_core.runnables import RunnableConfig
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL_BACKEND")



# made a simple function from gpt for calling get api calls
def _get(path, params=None):
    try:
        resp = requests.get(f"{BASE_URL}{path}", params=params, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        return {"error": f"Could not reach service: {e}"}

    if resp.status_code == 404:
        return {"error": "Not found."}

    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return {"error": f"Service error: {e}"}

    payload = resp.json()
    data = payload.get("data")
    if data is None:
        return {"error": "No data returned."}
    return data


def _post(path, json_body):
    try:
        resp = requests.post(f"{BASE_URL}{path}", json=json_body, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        return {"error": f"Could not reach service: {e}"}

    if resp.status_code == 400:
        return {"error": resp.json().get("message", "Invalid request.")}

    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return {"error": f"Service error: {e}"}

    payload = resp.json()
    data = payload.get("data")
    if data is None:
        return {"error": "No data returned."}
    return data


# ================================ Get Customer =======================================



@tool("get_customer_profile")
def get_customer_profile(config: RunnableConfig) -> dict:
    """
    Retrieve a customer's profile information using their customer ID.

    Use this when you need context about who the customer is before answering
    account-specific questions (e.g. "what's my order status", "what size do I usually buy").
    Do NOT use this to look up order details — use get_order_details for that.

    Returns a dict with the customer's profile fields, or an error message
    if the customer could not be found.

    :param config:
    """
    customer_id = config["configurable"]["customer_id"]

    print("Tool Call: Get Customer Profile")
    data = _get(f"/customers/{customer_id}")
    print("result: ", data)

    # TODO
    # filter the data you want to pass

    return data


# ============================ Get Order Details ================================

class GetOrderDetailsInput(BaseModel):
    order_id: str | None = Field(
        default=None,
        description="The order identifier, e.g. 'ORD-10293'. "
                    "This would be asked from the user and based on his response either all orders or specific orders would be retrived"
                    "User would be asked to give it"
    )


@tool("get_order_details", args_schema=GetOrderDetailsInput)
def get_order_details(config: RunnableConfig, order_id: str | None) -> dict:
    """
    Retrieve the Order details using their Order ID.

    The Order id is to be taken from the user. if the user does'nt remember the order id
    it would fetch all the customers orders

    Use this when the customer asks you anything about his order ie
        order status
        tacking status
        payment status
        etc

    Returns a dict with the Order details fields, or an error message

    :param config:
    :param order_id: can be none
    """

    customer_id = config["configurable"]["customer_id"]
    print("Tool Call: Get Order Details")
    if order_id:
        # order_id is given fetch that id
        order_details = _get(f"/orders/{order_id}")
    else:
        order_details = _get(f"/orders/customer/{customer_id}")

    print("result", order_details )

    if order_details:
        if isinstance(order_details
                , dict):
            if order_details.get("customerId") == customer_id:
                return order_details
            else:
                return {"error": "Order details could not be retrieved.",
                        "reason": "Customer didnt order any such order"}
        else:
            return {"orders": order_details}

    return {"error": "Order details could not be retrieved.",
            "reason": "No such order Exists"}

# ====================================== 3. search_products ================================

class SearchProductsInput(BaseModel):
    query: str | None = Field(
        default=None,
        description="Free-text search, e.g. 'blue denim jacket'. Matches product name/description."
    )
    category: str | None = Field(default=None, description="Exact category filter, e.g. 'jackets'.")
    color: str | None = Field(default=None, description="Exact color filter, e.g. 'blue'.")
    size: str | None = Field(default=None, description="Exact size filter, e.g. 'M'.")
    min_price: float | None = Field(default=None, description="Minimum price filter.")
    max_price: float | None = Field(default=None, description="Maximum price filter.")
    only_discounted: bool = Field(default=False, description="If true, only return products that have a discount.")
    sort_by_price: str | None = Field(
        default=None,
        description="'asc' for cheapest first, 'desc' for most expensive first. Use 'asc' for queries like 'cheapest products'."
    )
    limit: int = Field(default=10, ge=1, le=20, description="Max number of results to return.")


@tool("search_products", args_schema=SearchProductsInput)
def search_products(
        query: str | None = None,
        category: str | None = None,
        color: str | None = None,
        size: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        only_discounted: bool = False,
        sort_by_price: str | None = None,
        limit: int = 10,
) -> dict:
    """
    Search the product catalog by free text and/or filters (category, color, size,
    price range, discount, sort order).

    Use this when the customer is browsing or looking for something by description
    ("show me red dresses under $50", "cheapest products", "any discount available").
    Do NOT use this to check if a SPECIFIC known product is in stock — use
    check_product_availability for that instead.

    Returns a list of matching products (id, name, price, category, colors, sizes),
    or {"error": ...}.
    """
    params = {
        "q": query,
        "category": category,
        "color": color,
        "size": size,
        "minPrice": min_price,
        "maxPrice": max_price,
        "discount": True if only_discounted else None,
        "sort": f"price_{sort_by_price}" if sort_by_price in ("asc", "desc") else None,
        "limit": limit,
    }
    params = {k: v for k, v in params.items() if v is not None}
    print ("Tool Call: Search Products")
    res = _get("/products/search", params=params)
    return res


# ============================================ 4. check_product_availability ============================================
class CheckProductAvailabilityInput(BaseModel):
    product_id: str = Field(description="Product's database ID, obtained from search_products.")
    size: str | None = Field(default=None, description="Specific size to check, e.g. 'M'.")
    color: str | None = Field(default=None, description="Specific color to check, e.g. 'blue'.")


@tool("check_product_availability", args_schema=CheckProductAvailabilityInput)
def check_product_availability(
        product_id: str, size: str | None = None, color: str | None = None
) -> dict:
    """
    Check whether a specific product is in stock, optionally for a given size/color.

    Use this ONLY after a product has already been identified (via search_products
    or from an order). Do NOT use this to search the catalog.

    :param product_id: Product database ID, obtained from search_products.
    :param size: Specific size to check, e.g. 'M'
    :param color: Specific color to check, e.g. 'blue'


    Returns {"in_stock": bool, "stock": int, ...} or {"error": ...}.
    """
    print("Tool Call: Check Product Availability")
    result = _get(f"/products/{product_id}/availability", params={"size": size, "color": color})
    print("Result: ", result)
    if "error" in result:
        return result

    # The /availability endpoint already returns the per-variant answer
    # directly ({productId, size, color, quantity, inStock}) - it does NOT
    # return the raw product doc (no "sizes"/"colors"/"stock" keys), so there's
    # nothing further to check here.
    return {"in_stock": result.get("inStock", False), "stock": result.get("quantity", 0)}


#============================================ 5. recommend_products ============================================

class RecommendProductsInput(BaseModel):
    limit: int = Field(default=5, ge=1, le=10, description="Max number of recommendations.")


@tool("recommend_products", args_schema=RecommendProductsInput)
def recommend_products(config: RunnableConfig, limit: int = 5) -> dict:
    """
    Recommend products for the current customer based on their saved preferences
    (favorite color, budget, category, size).

    Use this when the customer asks for suggestions ("what would you recommend for me",
    "what should I buy") rather than searching by explicit criteria - use
    search_products when they give explicit criteria instead.

    :param limit: Max number of recommendations.

    Returns a list of recommended products, or {"error": ...}.
    """
    customer_id = config["configurable"]["customer_id"]
    print("Tool Call: Recommend Products")

    profile = _get(f"/customers/{customer_id}")
    if "error" in profile:
        return profile

    prefs = profile.get("preferences", {})
    params = {
        "category": prefs.get("category"),
        "color": prefs.get("favoriteColor"),
        "size": prefs.get("size"),
        "maxPrice": prefs.get("budget"),
        "limit": limit,
    }
    params = {k: v for k, v in params.items() if v is not None}

    result = _get("/products/search", params=params)
    print("result: ", result)
    return result
"""
Reads COMPANY_API_BASE_URL from env (instructions will say to set it to http://localhost:5000/api)
Looks up the seeded customer's real Mongo _id via a direct GET to /customers/lookup?phone=923001234567 (raw request, since get_customer_profile only accepts an already-known customer_id through RunnableConfig, not a phone number — the tool has no phone-lookup path)
Looks up the seeded product's real Mongo _id via search_products.invoke({"category": "Dresses"})
Calls get_customer_profile.invoke({}, config={"configurable": {"customer_id": <id>}})
Calls get_order_details.invoke({"order_id": "ORD-1001"}, config={"configurable": {"customer_id": <id>}})
Calls search_products.invoke({"category": "Dresses"})
Calls check_product_availability.invoke({"product_id": <id>, "size": "M", "color": "Blue"}) (expect in-stock) and again with color: "Red" (expect out-of-stock)"""


def _print_step(title: str, result) -> None:
    print(f"\n--- {title} ---")
    print(result)

if __name__ == "__main__":
    if not BASE_URL:
        raise SystemExit(
            "BASE_URL_BACKEND / COMPANY_API_BASE_URL is not set. "
            "e.g. export COMPANY_API_BASE_URL=http://localhost:5000/api"
        )

    # 1. Look up the seeded customer's real Mongo _id by phone (raw request).
    customer_lookup = _get("/customers/lookup", params={"phone": "923001234567"})
    _print_step("Customer lookup by phone", customer_lookup)

    customer_id = None
    if isinstance(customer_lookup, dict) and "error" not in customer_lookup:
        customer_id = customer_lookup.get("_id") or customer_lookup.get("id")

    if not customer_id:
        raise SystemExit(f"Could not resolve customer_id from lookup: {customer_lookup}")

    config = {"configurable": {"customer_id": customer_id}}

    # 2. Look up the seeded product's real Mongo _id via search_products.
    dresses = search_products.invoke({"category": "Dresses"})
    _print_step("search_products(category='Dresses')", dresses)

    product_id = None
    if isinstance(dresses, list) and dresses:
        first = dresses[0]
        product_id = first.get("_id") or first.get("id")
    elif isinstance(dresses, dict) and "error" not in dresses:
        product_id = dresses.get("_id") or dresses.get("id")

    # 3. get_customer_profile
    profile = get_customer_profile.invoke({}, config=config)
    _print_step("get_customer_profile", profile)

    # 4. get_order_details with a known order id
    order = get_order_details.invoke({"order_id": "ORD-1001"}, config=config)
    _print_step("get_order_details(order_id='ORD-1001')", order)

    # 5. get_order_details with no order id -> all customer orders
    all_orders = get_order_details.invoke({}, config=config)
    _print_step("get_order_details(no order_id -> all orders)", all_orders)

    # 6. check_product_availability -- expect in-stock
    if product_id:
        available = check_product_availability.invoke(
            {"product_id": product_id, "size": "M", "color": "Blue"}
        )
        _print_step("check_product_availability(size='M', color='Blue') [expect in-stock]", available)

        # 7. check_product_availability -- expect out-of-stock
        unavailable = check_product_availability.invoke(
            {"product_id": product_id, "size": "M", "color": "Red"}
        )
        _print_step("check_product_availability(size='M', color='Red') [expect out-of-stock]", unavailable)
    else:
        print("\nNo product_id resolved from search_products; skipping availability checks.")
