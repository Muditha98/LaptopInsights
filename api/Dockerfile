FROM python:3.11-slim

# Install ODBC drivers for SQL Server (updated for modern Debian)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    ca-certificates \
    apt-transport-https \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared modules
COPY database/ /app/database/
COPY models/ /app/models/
COPY config.py /app/config.py
COPY .env /app/.env

# Copy API code
COPY api/ /app/api/

# Install dependencies
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-dotenv==1.0.0 \
    pyodbc==5.0.1 \
    pydantic==2.5.3 \
    azure-search-documents==11.4.0 \
    azure-identity==1.16.0 \
    azure-ai-projects==1.0.0 \
    openai==1.54.4 \
    httpx==0.27.2 \
    aiohttp==3.9.1

# Expose port
EXPOSE 8000

# Run the API
CMD ["python", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
