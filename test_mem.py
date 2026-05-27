import sys
import psutil
import os
def print_mem():
    process = psutil.Process(os.getpid())
    print(f"Memory: {process.memory_info().rss / 1024 / 1024:.2f} MB")

print("Initial:")
print_mem()
from facenet_pytorch import MTCNN, InceptionResnetV1
print("After import:")
print_mem()
mtcnn = MTCNN()
resnet = InceptionResnetV1(pretrained='vggface2').eval()
print("After load:")
print_mem()
