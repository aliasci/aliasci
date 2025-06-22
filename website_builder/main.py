import os
import sys
import json
import base64
from datetime import datetime

import openai
import ipfshttpclient
import qrcode


def generate_website(prompt: str) -> str:
    """Generate HTML/CSS/JS for a website using OpenAI"""
    system_msg = (
        "You are a helpful assistant that writes short single page websites in HTML, CSS and JS. "
        "The site must be in a single file using a <style> tag for CSS and <script> tag for JavaScript."
    )
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": system_msg}, {"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()


def upload_to_ipfs(content: str) -> str:
    """Upload content to IPFS and return the CID URL"""
    client = ipfshttpclient.connect()
    res = client.add_bytes(content.encode())
    return f"https://ipfs.io/ipfs/{res}"


def create_domain_name(prompt: str) -> str:
    """Generate a handshake style domain name based on the prompt"""
    base = prompt.split()[0].lower()
    return f"{base}{datetime.utcnow().strftime('%H%M%S')}.cms"


def create_qr_code(ipfs_url: str, filename: str) -> None:
    img = qrcode.make(ipfs_url)
    img.save(filename)


def main(prompt: str) -> None:
    html = generate_website(prompt)
    ipfs_url = upload_to_ipfs(html)
    domain = create_domain_name(prompt)
    print(json.dumps({
        "title": prompt,
        "ipfs_url": ipfs_url,
        "domain": domain,
        "html": html,
    }, indent=2))
    create_qr_code(ipfs_url, "ipfs_qr.png")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py \"your prompt here\"")
        sys.exit(1)
    main(sys.argv[1])
