import os
from dotenv import load_dotenv
from transformers import pipeline, BartTokenizer

# Load environment variables
load_dotenv()

# Retrieve the Hugging Face API key
huggingface_api_key = os.getenv("HF_API_KEY")

# Initialize the summarization pipeline
pipe = pipeline("summarization", model="facebook/bart-large-cnn")

# Load the BART tokenizer
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

def split_into_chunks(text, chunk_size=1024):
    """Splits the input text into chunks of a specified size."""
    tokens = tokenizer.encode(text, truncation=False)
    chunks = [tokenizer.decode(tokens[i:i+chunk_size], skip_special_tokens=True) 
              for i in range(0, len(tokens), chunk_size)]
    return chunks

def summarize(text):
    """Summarizes the input text, handling long inputs by chunking."""
    # Tokenize and split into chunks if necessary
    chunks = split_into_chunks(text)
    summaries = []

    for chunk in chunks:
        # Generate the summary for each chunk
        summary = pipe(chunk)
        summaries.append(summary[0]['summary_text'])

    # Combine all summaries into a single summary
    return " ".join(summaries)

# Prompt user to input text for summarization
text_to_summarize = input("Enter the text to summarize: ")

# Generate and display the summary
summary = summarize(text_to_summarize)
print("\nSummary:")
print(summary)

# Save the summary to a file
with open("Total.txt", "w") as f:
    f.write(summary)