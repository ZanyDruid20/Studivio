import fitz
import re
import os
from transformers import pipeline
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Retrieve the Hugging Face API key
huggingface_api_key = os.getenv("HF_API_KEY")
# Initialize summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""

    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text += page.get_text()

    return text

def preprocess_text(text):
    # Clean the text
    text = re.sub(r'\s+', ' ', text)  # Remove extra whitespace and newlines
    text = re.sub(r'\n\d+\n', '', text)  # Remove page numbers
    text = re.sub(r'[^\w\s]', '', text)  # Remove special characters
    text = text.strip()  # Remove leading/trailing spaces
    
    return text

def summarize_text(text):
    summary = summarizer(text, max_length=150, min_length=50, do_sample=False)
    return summary[0]['summary_text']

def split_text_into_chunks(text, max_length=1024):
    # Split the text into chunks to fit the model's token limit
    words = text.split()
    chunks = []
    chunk = []

    for word in words:
        chunk.append(word)
        if len(" ".join(chunk)) > max_length:
            chunks.append(" ".join(chunk[:-1]))  # Add the chunk without the last word
            chunk = [word]  # Start a new chunk with the current word

    # Add the last chunk if any
    if chunk:
        chunks.append(" ".join(chunk))

    return chunks

def summarize_pdf(pdf_path):
    # Normalize the file path
    pdf_path = os.path.normpath(pdf_path)
    
    print("Checking file path:", pdf_path)  # For debugging
    
    if os.path.exists(pdf_path):
        print(f"File {pdf_path} found!")
    else:
        print(f"Error: {pdf_path} does not exist.")
        return "Summary generation failed."

    # Extract text from the PDF
    extracted_text = extract_text_from_pdf(pdf_path)
    
    # Preprocess the extracted text
    cleaned_text = preprocess_text(extracted_text)
    
    # Split the cleaned text into smaller chunks (if needed)
    chunks = split_text_into_chunks(cleaned_text)
    
    # Summarize each chunk
    summaries = [summarize_text(chunk) for chunk in chunks]
    
    # Combine all the summaries (optional: you can re-summarize the combined summary)
    full_summary = " ".join(summaries)
    
    return full_summary

# Example usage
pdf_path = "C:/Users/Furnom Dam/pommodorro/API Service/Safe Operating Space.pdf"
summary = summarize_pdf(pdf_path)
print(summary)

# Save the summary to a file
with open("PDFS.txt", "w") as f:
    f.write(summary)

print("Summary saved to PDFS.txt")


