import pandas as pd

# input / output files
INPUT = "1_op.csv"
OUTPUT = "2_filtered.csv"

# load csv
df = pd.read_csv(INPUT)

# Ensure boolean type for 'installable' column
if df["installable"].dtype == object:
    df["installable"] = df["installable"].str.lower() == "true"

# filter rows where installable is True
filtered = df[df["installable"] == True].copy()

# Add empty SSO_providers column
filtered["SSO_providers"] = ""

# save new csv
filtered.to_csv(OUTPUT, index=False)

print("Saved", len(filtered), "rows to", OUTPUT)

