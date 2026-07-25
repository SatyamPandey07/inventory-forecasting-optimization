import argparse
import random
import math
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_3year_retail_data(sku_id: str, sku_name: str, base_demand: int = 35) -> pd.DataFrame:
    """
    Generates 3 years (1,095 days) of daily historical demand data
    with annual seasonality, weekly weekend spikes, Black Friday surges, and random noise.
    """
    start_date = datetime(2023, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(1095)]
    records = []

    for i, date in enumerate(dates):
        day_of_year = date.timetuple().tm_yday
        day_of_week = date.weekday()

        # 1. Annual Seasonality (Sinusoidal trend + Q4 holiday surge)
        annual_factor = math.sin((day_of_year / 365.0) * 2 * math.pi) * 0.25
        
        # 2. Q4 Holiday & Black Friday Spike (Nov 15 - Dec 25)
        holiday_spike = 0.0
        if date.month == 11 and date.day >= 20: # Black Friday week
            holiday_spike = 1.2
        elif date.month == 12 and date.day <= 24: # Christmas shopping rush
            holiday_spike = 0.8
        elif date.month == 8 and date.day >= 15: # Back-to-School
            holiday_spike = 0.35

        # 3. Weekly Seasonality (Weekend surge)
        weekend_factor = 0.30 if day_of_week in [5, 6] else 0.0

        # 4. Multiplicative Noise
        random_noise = random.gauss(0, 0.15)

        multiplier = 1.0 + annual_factor + holiday_spike + weekend_factor + random_noise
        units_sold = max(1, int(round(base_demand * multiplier)))
        revenue = round(units_sold * random.uniform(25.0, 150.0), 2)

        records.append({
            "ds": date.strftime('%Y-%m-%d'),
            "sku_id": sku_id,
            "sku_name": sku_name,
            "units_sold": units_sold,
            "revenue": revenue
        })

    return pd.DataFrame(records)

def seed_10_skus():
    skus = [
        ("SKU-ELEC-100", "Wireless Ergonomic Keyboard", 35),
        ("SKU-APPL-200", "Smart Espresso Coffee Machine", 15),
        ("SKU-APPA-300", "Organic Cotton Hooded Sweatshirt", 60),
        ("SKU-[#104]", "Noise-Canceling Wireless Headphones", 45),
        ("SKU-[#105]", "Stainless Steel Insulated Water Bottle", 80),
        ("SKU-[#106]", "Ultra-Wide Gaming Monitor 34-inch", 12),
        ("SKU-[#107]", "Standing Motorized Desk Frame", 20),
        ("SKU-[#108]", "Chef Multi-Cooker Air Fryer", 28),
        ("SKU-[#109]", "Ergonomic Mesh Office Chair", 25),
        ("SKU-[#110]", "Smart Fitness Tracker Watch", 55),
    ]

    all_dfs = []
    print("🌱 Generating 3 years (1,095 days) of sample demand data for 10 SKUs...")

    for sku_id, name, base_d in skus:
        df = generate_3year_retail_data(sku_id, name, base_d)
        all_dfs.append(df)
        print(f"  ✓ {sku_id}: {name} -> {len(df)} days generated (Avg: {df['units_sold'].mean():.1f} units/day)")

    full_df = pd.concat(all_dfs, ignore_index=True)
    print(f"\n✅ Total {len(full_df)} records generated across 10 SKUs.")
    return full_df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed 3 years of retail demand data for 10 SKUs")
    parser.add_argument("--dry-run", action="store_true", help="Print summary without inserting into DB")
    args = parser.parse_args()

    df = seed_10_skus()
    if args.dry_run:
        print("Dry run completed successfully.")
