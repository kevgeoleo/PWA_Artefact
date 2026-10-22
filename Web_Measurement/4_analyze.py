import pandas as pd
from collections import Counter

INPUT_FILE = "3_output.csv"

df = pd.read_csv(INPUT_FILE)

# Replace NaN with empty string
df["SSO_providers"] = df["SSO_providers"].fillna("")

# Count websites with SSO
has_sso = df["SSO_providers"].str.strip() != ""

sso_website_count = has_sso.sum()

print("Websites with at least one SSO provider:", sso_website_count)

# Count each SSO provider
provider_counter = Counter()

for providers in df["SSO_providers"]:

    if pd.isna(providers) or str(providers).strip() == "":
        continue

    split_providers = [p.strip() for p in str(providers).split(",")]

    provider_counter.update(split_providers)

print("\nSSO Provider Counts:\n")

for provider, count in sorted(provider_counter.items()):
    print(f"{provider}: {count}")