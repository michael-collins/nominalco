#!/usr/bin/env python3
"""Start an HTTP server and open the admin page in the default browser."""

import http.server
import socketserver
import webbrowser
import sys
import threading

PORT = 4601
DIRECTORY = "."


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def open_browser():
    url = f"http://localhost:{PORT}/admin/"
    print(f"Opening {url} in your default browser…")
    webbrowser.open(url)


if __name__ == "__main__":
    # Open the browser after a short delay so the server is ready
    threading.Timer(1.0, open_browser).start()

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving http://localhost:{PORT}/")
        print(f"Admin → http://localhost:{PORT}/admin/")
        print("Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
