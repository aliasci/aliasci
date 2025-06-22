# Decentralized Web Builder

This is a prototype that generates a simple web site from a user prompt using OpenAI, uploads it to IPFS, and returns a Handshake-style `.cms` domain.

## Usage

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set the `OPENAI_API_KEY` environment variable to your OpenAI key.
3. Run the script with a prompt:
   ```bash
   python main.py "A modern looking cafe website"
   ```

The script outputs an IPFS link and a suggested `.cms` domain name.
