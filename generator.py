# This is no longer being used, this was my concept for what is now in the js version.
import csv
import itertools
from typing import List, Dict
import json

def generate_combinations(parameters: List[Dict[str, List[str]]]) -> List[List[str]]:
    """Generate all possible combinations of parameter values."""
    parameter_values = [param['values'] for param in parameters]
    return list(itertools.product(*parameter_values))

def create_csv(parameters: List[Dict[str, str]], combinations: List[List[str]], output_file: str):
    """Create a CSV file with the parameter combinations."""
    headers = ['Description'] + [f"{param['name']}##{param['type']}##{param['unit']}" for param in parameters]
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for i, combination in enumerate(combinations, 1):
            writer.writerow([f"Row_{i}"] + list(combination))

def process_parameters(input_json: str, output_file: str):
    """Process parameters from JSON and create CSV output."""
    parameters = json.loads(input_json)
    combinations = generate_combinations(parameters)
    create_csv(parameters, combinations, output_file)

if __name__ == "__main__":
    # Example usage
    parameters = [
        {
            "name": "Box_Type_Control",
            "type": "OTHER",
            "unit": "GENERAL",
            "values": [f"FTI_Elec_Box_Box_Type_Ctrl_{str(i).zfill(2)}" for i in range(1, 21)]
        },
        {
            "name": "Box_Type",
            "type": "OTHER",
            "unit": "GENERAL",
            "values": [f"FTI_Elec_Box_Box_Type_{str(i).zfill(2)}" for i in range(1, 21)]
        }
    ]
    process_parameters(json.dumps(parameters), "revit-lookup-table.csv")
