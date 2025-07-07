import openai # type: ignore
import os

def gpt_summarise(text, content_type="general", model="gpt-4-1106-preview"):
    """Generate summary and return as plain text"""
    try:
        # Different prompts for different content types
        prompts = {
            "youtube": "Turn this YouTube transcript into structured lecture notes with clear sections: Overview, Key Concepts, Examples, and Summary. Use proper headings and bullet points.",
            "pdf": "Turn this PDF content into organized study notes with main topics as headings, key points as bullets, and clear sections.",
            "audio": "Turn this audio transcript into well-formatted notes with speaker identification, main topics as headings, and key points organized.",
            "general": "Turn the transcript into structured lecture notes with sections like Overview, Key Concepts, Examples, and Summary."
        }
        
        prompt = f"{prompts.get(content_type, prompts['general'])}\n\n{text}"
        response = openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        summary = response.choices[0].message.content
        return summary  # Return as plain text string
        
    except Exception as e:
        print(f"GPT summarisation error: {e}")
        return "Failed to generate summary."