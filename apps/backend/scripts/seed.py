import csv
import json

from app.core.database import get_session  # database sesision generator
from app.models.problem import Problem  # Adjust path to your Problem model
from app.models.enums import ProblemDifficulty  # Adjust path to your Difficulty enum


def seed_from_csv(file_path: str = "scripts/problems.csv") -> None:
    print(f"🌱 Attempting to seed data from: {file_path}")
    
    try:
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            
            try:
                # Grab the session from your generator function
                session_generator = get_session()
                session = next(session_generator)
                
                count = 0
                for row in reader:
                    test_cases_data = json.loads(row["test_case"])
                    
                    problem = Problem(
                        title=row["title"],
                        description=row["description"],
                        start_code=row["start_code"],
                        difficulty=ProblemDifficulty(row["difficulty"].lower()),
                        test_case=test_cases_data,
                    )

                    session.add(problem)
                    count += 1
                
                session.commit()
                print(f"✨ Successfully seeded {count} problems into Supabase!")
                
            finally:
                # Manually trigger the generator to close so it cleans up properly
                try:
                    next(session_generator)
                except StopIteration:
                    pass  # Expected behavior when a generator finishes yielding
                    
    except FileNotFoundError:
        print(f"❌ Error: Could not find the CSV file at '{file_path}'.")
    except json.JSONDecodeError as e:
        print(f"❌ Error decoding JSON from the 'test_case' column: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    seed_from_csv()