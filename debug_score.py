import os
import json
import anthropic

def test_scoring():
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    
    print(f"API key present: {bool(api_key)}")
    print(f"API key length: {len(api_key)}")
    print(f"API key prefix: {api_key[:10]}..." if len(api_key) > 10 else "API key too short")

    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY is empty")
        return

    try:
        client = anthropic.Anthropic(api_key=api_key)
        print("Client created successfully")

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=50,
            messages=[{"role": "user", "content": "Reply with only this JSON: {\"score\": 5, \"reason\": \"test\"}"}],
        )
        print(f"API response: {message.content[0].text}")
        print("SCORING WORKS")

    except anthropic.AuthenticationError as e:
        print(f"AUTH ERROR — API key is invalid or wrong: {e}")
    except anthropic.APIConnectionError as e:
        print(f"CONNECTION ERROR: {e}")
    except Exception as e:
        print(f"UNEXPECTED ERROR: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_scoring()
