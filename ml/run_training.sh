#!/bin/bash

echo "======================================================================"
echo "  Starting Comprehensive Model Training"
echo "======================================================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found!"
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and use venv python
source venv/bin/activate

echo "✅ Virtual environment activated"
echo ""
echo "🐍 Python version:"
which python3
python3 --version

echo ""
echo "📦 Checking dependencies..."
python3 -c "import pandas, numpy, sklearn, xgboost, lightgbm; print('✅ All dependencies installed')" 2>&1 || {
    echo "⚠️  Installing missing dependencies..."
    pip3 install pandas numpy scikit-learn xgboost lightgbm matplotlib seaborn joblib
}

echo ""
echo "🚀 Running training script..."
echo ""

python3 train_all_models.py

echo ""
echo "======================================================================"
echo "  Training Complete!"
echo "======================================================================"
