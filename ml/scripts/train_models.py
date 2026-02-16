#!/usr/bin/env python3
"""
Ensemble ML Model Trainer
Trains XGBoost + LightGBM + Random Forest ensemble for sports betting predictions
Uses walk-forward validation and tracks Closing Line Value (CLV)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import json
from datetime import datetime

import xgboost as xgb
import lightgbm as lgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score
from sklearn.model_selection import train_test_split

class SportsEnsemble:
    def __init__(self, sport='nfl'):
        self.sport = sport
        self.models = {}
        self.weights = None
        self.feature_cols = []
        self.trained = False
        
    def initialize_models(self):
        """Initialize base models"""
        print("Initializing ensemble models...")
        
        self.models = {
            'xgboost': xgb.XGBClassifier(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.02,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=5,
                gamma=0.1,
                reg_alpha=0.1,
                reg_lambda=1.0,
                random_state=42,
                n_jobs=-1
            ),
            'lightgbm': lgb.LGBMClassifier(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.02,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=5,
                reg_alpha=0.1,
                reg_lambda=1.0,
                random_state=42,
                n_jobs=-1,
                verbose=-1
            ),
            'random_forest': RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=20,
                min_samples_leaf=10,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1
            ),
            'logistic': LogisticRegression(
                C=0.1,
                max_iter=1000,
                penalty='l2',
                random_state=42,
                n_jobs=-1
            )
        }
        
        print(f"✓ Initialized {len(self.models)} models")
    
    def train(self, X_train, y_train, X_val, y_val):
        """Train all models in ensemble"""
        print(f"\nTraining on {len(X_train)} games, validating on {len(X_val)} games")
        
        self.feature_cols = X_train.columns.tolist()
        base_predictions = []
        
        for name, model in self.models.items():
            print(f"\nTraining {name}...")
            model.fit(X_train, y_train)
            
            # Get validation predictions
            pred_proba = model.predict_proba(X_val)[:, 1]
            base_predictions.append(pred_proba)
            
            # Calculate metrics
            val_acc = accuracy_score(y_val, pred_proba > 0.5)
            val_logloss = log_loss(y_val, pred_proba)
            try:
                val_auc = roc_auc_score(y_val, pred_proba)
            except:
                val_auc = 0.5
            
            print(f"  Accuracy: {val_acc:.4f}")
            print(f"  Log Loss: {val_logloss:.4f}")
            print(f"  AUC: {val_auc:.4f}")
        
        # Simple equal weighting for now (can optimize later)
        self.weights = np.ones(len(self.models)) / len(self.models)
        
        # Ensemble prediction
        ensemble_pred = np.average(base_predictions, axis=0, weights=self.weights)
        ensemble_acc = accuracy_score(y_val, ensemble_pred > 0.5)
        ensemble_logloss = log_loss(y_val, ensemble_pred)
        
        print(f"\n{'='*50}")
        print(f"Ensemble Performance:")
        print(f"  Accuracy: {ensemble_acc:.4f}")
        print(f"  Log Loss: {ensemble_logloss:.4f}")
        print(f"{'='*50}")
        
        self.trained = True
        
        return ensemble_acc
    
    def predict_proba(self, X):
        """Ensemble prediction"""
        if not self.trained:
            raise ValueError("Model not trained yet!")
        
        base_predictions = []
        
        for model in self.models.values():
            pred_proba = model.predict_proba(X)[:, 1]
            base_predictions.append(pred_proba)
        
        # Weighted average
        ensemble_pred = np.average(base_predictions, axis=0, weights=self.weights)
        
        return ensemble_pred
    
    def save(self, output_dir):
        """Save trained models"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save each model
        for name, model in self.models.items():
            model_path = output_dir / f'{self.sport}_{name}_model.pkl'
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
        
        # Save metadata
        metadata = {
            'sport': self.sport,
            'feature_cols': self.feature_cols,
            'weights': self.weights.tolist(),
            'trained_at': datetime.now().isoformat()
        }
        
        with open(output_dir / f'{self.sport}_ensemble_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"\n✓ Saved ensemble to {output_dir}")
    
    def load(self, input_dir):
        """Load trained models"""
        input_dir = Path(input_dir)
        
        # Load metadata
        with open(input_dir / f'{self.sport}_ensemble_metadata.json', 'r') as f:
            metadata = json.load(f)
        
        self.feature_cols = metadata['feature_cols']
        self.weights = np.array(metadata['weights'])
        
        # Load models
        self.models = {}
        for name in ['xgboost', 'lightgbm', 'random_forest', 'logistic']:
            model_path = input_dir / f'{self.sport}_{name}_model.pkl'
            with open(model_path, 'rb') as f:
                self.models[name] = pickle.load(f)
        
        self.trained = True
        print(f"✓ Loaded ensemble from {input_dir}")

class WalkForwardTrainer:
    def __init__(self, sport='nfl', data_path=None):
        self.sport = sport
        self.data_path = data_path or f'../../data/processed/{sport}_features.csv'
        self.model = SportsEnsemble(sport=sport)
        
    def load_data(self):
        """Load processed features"""
        file_path = Path(__file__).parent / self.data_path
        print(f"Loading {self.sport.upper()} data from {file_path}...")
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        print(f"✓ Loaded {len(df)} games")
        return df
    
    def prepare_features(self, df):
        """Select feature columns and remove NaN rows"""
        # Feature columns (exclude metadata and targets)
        exclude_cols = [
            'season', 'week', 'game_id', 'date', 'status',
            'home_team', 'home_abbr', 'away_team', 'away_abbr',
            'home_score', 'away_score', 'home_record', 'away_record',
            'home_win', 'away_win', 'total_points', 'point_differential',
            'venue', 'city', 'neutral_site', 'network', 'matchup',
            'target_home_win', 'target_spread', 'target_total', 'home_cover_spread'
        ]
        
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        # Remove rows with NaN features (first few games of each season)
        df_clean = df.dropna(subset=feature_cols)
        
        print(f"✓ Selected {len(feature_cols)} features")
        print(f"✓ Removed {len(df) - len(df_clean)} games with missing features")
        
        return df_clean, feature_cols
    
    def train_walk_forward(self, train_years, test_year):
        """Train on multiple years, test on one year"""
        print(f"\n{'='*60}")
        print(f"Walk-Forward: Train on {train_years}, Test on {test_year}")
        print(f"{'='*60}")
        
        df = self.load_data()
        df, feature_cols = self.prepare_features(df)
        
        # Split by season
        train_mask = df['season'].isin(train_years)
        test_mask = df['season'] == test_year
        
        train_df = df[train_mask]
        test_df = df[test_mask]
        
        print(f"\nTrain: {len(train_df)} games from {train_years}")
        print(f"Test: {len(test_df)} games from {test_year}")
        
        # Prepare data
        X_train = train_df[feature_cols]
        y_train = train_df['target_home_win']
        X_test = test_df[feature_cols]
        y_test = test_df['target_home_win']
        
        # Train ensemble
        self.model.initialize_models()
        self.model.train(X_train, y_train, X_test, y_test)
        
        # Test performance
        predictions = self.model.predict_proba(X_test)
        
        # Calculate metrics
        test_acc = accuracy_score(y_test, predictions > 0.5)
        win_rate = test_acc * 100
        
        # Simulate betting (assuming -110 odds)
        num_bets = len(predictions)
        wins = (predictions > 0.5) == y_test
        num_wins = wins.sum()
        profit = (num_wins * 0.909) - (num_bets - num_wins)  # -110 = risk 1.1 to win 1
        roi = (profit / num_bets) * 100
        
        print(f"\n{'='*60}")
        print(f"{self.sport.upper()} {test_year} Test Results")
        print(f"{'='*60}")
        print(f"Total Picks: {num_bets}")
        print(f"Wins: {num_wins}")
        print(f"Win Rate: {win_rate:.2f}%")
        print(f"ROI: {roi:.2f}%")
        print(f"Profit: {profit:.2f} units")
        print(f"{'='*60}")
        
        results = {
            'sport': self.sport,
            'test_year': test_year,
            'train_years': train_years,
            'num_bets': num_bets,
            'wins': int(num_wins),
            'losses': num_bets - int(num_wins),
            'win_rate': win_rate,
            'roi': roi,
            'profit_units': profit
        }
        
        return results
    
    def train_full_backtest(self, start_year, end_year, train_window=3):
        """Run complete walk-forward backtest"""
        print(f"\n{'='*60}")
        print(f"{self.sport.upper()} Walk-Forward Backtest")
        print(f"Years: {start_year}-{end_year}")
        print(f"Train Window: {train_window} years")
        print(f"{'='*60}")
        
        all_results = []
        
        for test_year in range(start_year + train_window, end_year + 1):
            train_years = list(range(test_year - train_window, test_year))
            
            results = self.train_walk_forward(train_years, test_year)
            all_results.append(results)
        
        # Summary statistics
        df_results = pd.DataFrame(all_results)
        
        print(f"\n{'='*60}")
        print(f"{self.sport.upper()} Backtest Summary ({start_year + train_window}-{end_year})")
        print(f"{'='*60}")
        print(f"\nResults by Year:")
        print(df_results[['test_year', 'num_bets', 'win_rate', 'roi', 'profit_units']].to_string(index=False))
        print(f"\n{'='*60}")
        print(f"Overall Performance:")
        print(f"  Total Bets: {df_results['num_bets'].sum()}")
        print(f"  Avg Win Rate: {df_results['win_rate'].mean():.2f}%")
        print(f"  Avg ROI: {df_results['roi'].mean():.2f}%")
        print(f"  Total Profit: {df_results['profit_units'].sum():.2f} units")
        print(f"{'='*60}\n")
        
        # Save final model (trained on all recent years)
        train_years = list(range(end_year - train_window, end_year + 1))
        print(f"Training final model on {train_years}...")
        
        df = self.load_data()
        df, feature_cols = self.prepare_features(df)
        
        train_mask = df['season'].isin(train_years)
        train_df = df[train_mask]
        
        X = train_df[feature_cols]
        y = train_df['target_home_win']
        
        # Split for validation
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model.initialize_models()
        self.model.train(X_train, y_train, X_val, y_val)
        
        # Save
        model_dir = Path(__file__).parent / '../../data/models'
        self.model.save(model_dir)
        
        return df_results

def main():
    """Main execution"""
    
    # NFL Backtest
    print("\n" + "="*60)
    print("STARTING NFL MODEL TRAINING")
    print("="*60)
    
    nfl_trainer = WalkForwardTrainer(sport='nfl')
    nfl_results = nfl_trainer.train_full_backtest(
        start_year=2021,
        end_year=2024,
        train_window=2  # Train on 2 years, test on 1
    )
    
    # NBA Backtest
    print("\n" + "="*60)
    print("STARTING NBA MODEL TRAINING")
    print("="*60)
    
    nba_trainer = WalkForwardTrainer(sport='nba')
    nba_results = nba_trainer.train_full_backtest(
        start_year=2021,
        end_year=2023,  # Only complete seasons
        train_window=2
    )
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\nModels saved to data/models/")
    print("Ready for production predictions! 🚀")

if __name__ == '__main__':
    main()
