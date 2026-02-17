#!/usr/bin/env python3
"""
Train Ensemble ML Model
XGBoost + LightGBM + Random Forest + Logistic Regression
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
from datetime import datetime

from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score
import xgboost as xgb
import lightgbm as lgb

def prepare_features(df):
    """
    Prepare feature matrix and target variable
    """
    print("📊 Preparing features...")
    
    # Feature columns (exclude target and metadata)
    feature_cols = [
        'home_elo_before', 'away_elo_before', 'elo_diff',
        'home_ppg_last_3', 'away_ppg_last_3',
        'home_ppg_last_5', 'away_ppg_last_5',
        'home_ppg_last_10', 'away_ppg_last_10',
        'home_win_pct_last_3', 'away_win_pct_last_3',
        'home_win_pct_last_5', 'away_win_pct_last_5',
        'home_win_pct_last_10', 'away_win_pct_last_10',
        'home_rest_days', 'away_rest_days', 'rest_advantage',
        'home_momentum', 'away_momentum',
        'implied_spread'
    ]
    
    # Filter to columns that exist
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    X = df[feature_cols].fillna(0)
    y = df['home_win']
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Samples: {len(X)}")
    print(f"   Target distribution: {y.mean()*100:.1f}% home wins")
    
    return X, y, feature_cols

def train_ensemble_model(X_train, y_train, X_test, y_test):
    """
    Train ensemble model with multiple algorithms
    """
    print("\n🤖 Training ensemble model...")
    
    # Define base models
    print("   Training XGBoost...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=500,
        learning_rate=0.01,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='logloss',
        verbosity=0
    )
    xgb_model.fit(X_train, y_train)
    
    print("   Training LightGBM...")
    lgb_model = lgb.LGBMClassifier(
        n_estimators=500,
        learning_rate=0.01,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=-1
    )
    lgb_model.fit(X_train, y_train)
    
    print("   Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_split=10,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    
    print("   Training Logistic Regression...")
    lr_model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        random_state=42
    )
    lr_model.fit(X_train, y_train)
    
    # Create stacking ensemble
    print("   Creating ensemble...")
    ensemble = StackingClassifier(
        estimators=[
            ('xgb', xgb_model),
            ('lgb', lgb_model),
            ('rf', rf_model)
        ],
        final_estimator=lr_model,
        cv=5,
        n_jobs=-1
    )
    
    ensemble.fit(X_train, y_train)
    
    # Evaluate
    train_preds = ensemble.predict(X_train)
    test_preds = ensemble.predict(X_test)
    
    train_proba = ensemble.predict_proba(X_train)[:, 1]
    test_proba = ensemble.predict_proba(X_test)[:, 1]
    
    train_acc = accuracy_score(y_train, train_preds)
    test_acc = accuracy_score(y_test, test_preds)
    
    train_logloss = log_loss(y_train, train_proba)
    test_logloss = log_loss(y_test, test_proba)
    
    train_auc = roc_auc_score(y_train, train_proba)
    test_auc = roc_auc_score(y_test, test_proba)
    
    print(f"\n📊 Ensemble Performance:")
    print(f"   Train Accuracy: {train_acc*100:.2f}%")
    print(f"   Test Accuracy: {test_acc*100:.2f}%")
    print(f"   Train Log Loss: {train_logloss:.4f}")
    print(f"   Test Log Loss: {test_logloss:.4f}")
    print(f"   Train AUC: {train_auc:.4f}")
    print(f"   Test AUC: {test_auc:.4f}")
    
    return ensemble, {
        'train_acc': train_acc,
        'test_acc': test_acc,
        'train_logloss': train_logloss,
        'test_logloss': test_logloss,
        'train_auc': train_auc,
        'test_auc': test_auc
    }

def calculate_betting_performance(model, X_test, y_test, df_test):
    """
    Calculate realistic betting performance metrics
    Assumes -110 odds (American odds)
    """
    print("\n💰 Calculating betting performance...")
    
    # Get predictions
    proba = model.predict_proba(X_test)[:, 1]
    
    # Betting strategy: Only bet when model confidence > 55%
    high_confidence = proba > 0.55
    
    if high_confidence.sum() == 0:
        print("   ⚠️ No high-confidence bets")
        return None
    
    # Filter to high confidence bets
    bets_proba = proba[high_confidence]
    bets_actual = y_test[high_confidence]
    
    # Calculate results
    bets_pred = (bets_proba > 0.5).astype(int)
    wins = (bets_pred == bets_actual).sum()
    losses = len(bets_actual) - wins
    win_rate = wins / len(bets_actual)
    
    # ROI calculation (assuming -110 odds)
    # Win: +0.91 units (bet $110 to win $100)
    # Loss: -1.00 unit
    profit = wins * 0.91 - losses * 1.0
    roi = profit / len(bets_actual)
    
    print(f"   Total bets: {len(bets_actual)}")
    print(f"   Wins: {wins} | Losses: {losses}")
    print(f"   Win Rate: {win_rate*100:.2f}%")
    print(f"   Profit: {profit:+.2f} units")
    print(f"   ROI: {roi*100:+.2f}%")
    
    # Betting threshold is break-even at 52.4% win rate
    if win_rate > 0.524:
        print(f"   ✅ PROFITABLE (above 52.4% break-even)")
    else:
        print(f"   ⚠️ Not profitable (below 52.4% break-even)")
    
    return {
        'total_bets': len(bets_actual),
        'wins': int(wins),
        'losses': int(losses),
        'win_rate': win_rate,
        'profit': profit,
        'roi': roi
    }

def main():
    print("🚀 EdgeForce ML Model Training Pipeline\n")
    
    # Load features
    data_path = Path(__file__).parent.parent / 'data' / 'processed' / 'nba_features_2023.csv'
    df = pd.read_csv(data_path)
    df['date'] = pd.to_datetime(df['date'])
    
    print(f"📊 Loaded {len(df)} games")
    
    # Prepare features
    X, y, feature_cols = prepare_features(df)
    
    # Time-based train/test split (80/20)
    split_idx = int(len(df) * 0.8)
    
    X_train = X[:split_idx]
    X_test = X[split_idx:]
    y_train = y[:split_idx]
    y_test = y[split_idx:]
    df_test = df[split_idx:]
    
    print(f"\n📊 Train/Test Split:")
    print(f"   Train: {len(X_train)} games ({split_idx/len(df)*100:.0f}%)")
    print(f"   Test: {len(X_test)} games ({(len(df)-split_idx)/len(df)*100:.0f}%)")
    
    # Train model
    model, metrics = train_ensemble_model(X_train, y_train, X_test, y_test)
    
    # Calculate betting performance
    betting_metrics = calculate_betting_performance(model, X_test, y_test, df_test)
    
    # Save model
    model_dir = Path(__file__).parent.parent / 'data' / 'models'
    model_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = model_dir / 'nba_ensemble_2023.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump({
            'model': model,
            'feature_cols': feature_cols,
            'metrics': metrics,
            'betting_metrics': betting_metrics,
            'trained_at': datetime.now().isoformat()
        }, f)
    
    print(f"\n✅ Model saved to: {model_path}")
    print(f"\n🎯 Model ready for production predictions!")
    
    # Summary
    print(f"\n" + "="*70)
    print(f"📊 FINAL MODEL PERFORMANCE")
    print(f"="*70)
    print(f"Accuracy: {metrics['test_acc']*100:.2f}%")
    if betting_metrics:
        print(f"Win Rate: {betting_metrics['win_rate']*100:.2f}%")
        print(f"ROI: {betting_metrics['roi']*100:+.2f}%")
        print(f"Total Profit: {betting_metrics['profit']:+.2f} units on {betting_metrics['total_bets']} bets")
    print(f"="*70)

if __name__ == '__main__':
    main()
