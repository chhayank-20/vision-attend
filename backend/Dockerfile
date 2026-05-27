FROM python:3.13-slim

# Create a non-root user (Hugging Face Spaces requirement)
RUN useradd -m -u 1000 user

WORKDIR /app

# Install system dependencies for OpenCV and ML libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglx-mesa0 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Change ownership of the working directory to the non-root user
RUN chown -R user:user /app
USER user

# Install dependencies first to leverage Docker cache
COPY --chown=user:user pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Copy the rest of the application
COPY --chown=user:user . .

# Cache the ML models into the Docker image during build so it boots up instantly
RUN uv run python -c "from facenet_pytorch import MTCNN, InceptionResnetV1; MTCNN(); InceptionResnetV1(pretrained='vggface2').eval(); print('Models cached.')"

# Expose port 7860 (Hugging Face Spaces requirement)
EXPOSE 7860

# Limit PyTorch threads to prevent CPU thrashing on Spaces
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1

# Start the application on port 7860
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
