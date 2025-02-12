from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer
import torch.nn as nn

# Define the NewsModel class (needed for loading the model)
class NewsModel(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, embed_matrix=None):
        super(NewsModel, self).__init__()
        if embed_matrix is not None:
            self.embedding_layer = nn.Embedding.from_pretrained(embed_matrix)
        else:
            self.embedding_layer = nn.Embedding(vocab_size, embedding_dim)
        self.rnn_layer = nn.GRU(embedding_dim, hidden_dim, num_layers=1, batch_first=True)
        self.dense_layer = nn.Linear(hidden_dim, 2)

    def forward(self, x):
        e = self.embedding_layer(x)
        h, _ = self.rnn_layer(e)
        h = h[:, -1, :]
        y = self.dense_layer(h)
        return y

# Initialize Flask app
app = Flask(__name__)

# Load the model and tokenizer
MODEL_PATH = "news_model.pth"
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Load the trained model
model = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
model.eval()

# Define a function to process news text and make predictions
def predict_news(news_text):
    inputs = tokenizer(news_text, padding=True, truncation=True, return_tensors="pt", max_length=128)
    with torch.no_grad():
        outputs = model(inputs["input_ids"])
        prediction = torch.argmax(outputs, dim=1).item()
    label_map = {0: "Decrease", 1: "Increase"}
    return label_map[prediction]

# Define API endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    news_text = data.get("text", "")
    if not news_text:
        return jsonify({"error": "No text provided"}), 400
    prediction = predict_news(news_text)
    return jsonify({"prediction": prediction})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
