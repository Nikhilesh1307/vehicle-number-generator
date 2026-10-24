#!/usr/bin/env python3
"""
Vehicle Number Generator (0000 - 9999).
Generates random 4-digit vehicle registration numbers based on a chosen digit total (0-9).
"""

import argparse
import random
import sys
from typing import List, Tuple


def calculate_digital_root(num_str: str) -> Tuple[int, List[Tuple[str, int]]]:
    """
    Computes the repeated digit sum (digital root) of a 4-digit number string,
    returning the final single digit and the step-by-step calculation breakdown.

    Example for '9998':
      Step 1: 9 + 9 + 9 + 8 = 35
      Step 2: 3 + 5 = 8
      Result: 8
    """
    clean_str = num_str.strip()
    if not clean_str:
        return 0, [("0", 0)]

    steps: List[Tuple[str, int]] = []
    current_digits = [int(ch) for ch in clean_str]

    # Special case: all zeroes
    if all(d == 0 for d in current_digits):
        return 0, [(" + ".join("0" for _ in current_digits), 0)]

    current_val = sum(current_digits)
    steps.append((" + ".join(str(d) for d in current_digits), current_val))

    while current_val >= 10:
        digits = [int(ch) for ch in str(current_val)]
        current_val = sum(digits)
        steps.append((" + ".join(str(d) for d in digits), current_val))

    return current_val, steps


def generate_random_4digit(target: int) -> str:
    """
    Generates a uniform random 4-digit number between '0000' and '9999'
    whose digital root equals target.
    
    Target 0: '0000' (1 unique number)
    Target 1..9: Exactly 1,111 valid numbers given by target + 9 * k for k in [0..1110].
    """
    if target < 0 or target > 9:
        raise ValueError("Target must be between 0 and 9.")

    if target == 0:
        return "0000"

    # There are 1,111 numbers (k from 0 to 1110)
    # Minimum: target + 9*0 = target
    # Maximum: target + 9*1110 <= 9 + 9990 = 9999
    k = random.randint(0, 1110)
    val = target + 9 * k
    return f"{val:04d}"


def get_all_matching_4digits(target: int) -> List[str]:
    """Returns all 4-digit numbers whose digital root equals target."""
    if target < 0 or target > 9:
        raise ValueError("Target must be between 0 and 9.")
    if target == 0:
        return ["0000"]
    return [f"{target + 9 * k:04d}" for k in range(1111)]


def format_breakdown(num_str: str) -> str:
    """Returns a readable step-by-step breakdown string."""
    final_digit, steps = calculate_digital_root(num_str)
    lines = []
    for idx, (expr, total) in enumerate(steps, start=1):
        lines.append(f"  Step {idx}: {expr} = {total}")
    lines.append(f"  -> Final Single-Digit Total: {final_digit}")
    return "\n".join(lines)


def run_tests():
    """Validates the mathematical correctness over all 10,000 numbers from 0000 to 9999."""
    print("=" * 60)
    print("RUNNING VERIFICATION TEST SUITE (0000 - 9999)")
    print("=" * 60)

    bucket_counts = {i: 0 for i in range(10)}

    for n in range(10000):
        s = f"{n:04d}"
        root, _ = calculate_digital_root(s)
        bucket_counts[root] += 1

    print("Checking counts per target digit (0..9):")
    print(f"  Target 0: {bucket_counts[0]} (Expected: 1 -> '0000')")
    assert bucket_counts[0] == 1, f"Expected 1 number for target 0, got {bucket_counts[0]}"

    for t in range(1, 10):
        print(f"  Target {t}: {bucket_counts[t]} (Expected: 1,111)")
        assert bucket_counts[t] == 1111, f"Expected 1111 numbers for target {t}, got {bucket_counts[t]}"

    total = sum(bucket_counts.values())
    print(f"Total numbers partitioned: {total} / 10,000")
    assert total == 10000, "All 10,000 numbers must be covered."

    # Test random generator accuracy
    print("\nTesting uniform random generator sampling (1,000 samples per digit)...")
    for t in range(10):
        for _ in range(1000):
            res = generate_random_4digit(t)
            root, _ = calculate_digital_root(res)
            assert root == t, f"Generated {res} for target {t}, but root is {root}"

    # Test user's specific example: 9998 -> 35 -> 8
    ex_root, ex_steps = calculate_digital_root("9998")
    assert ex_root == 8, f"9998 should reduce to 8, got {ex_root}"
    assert ex_steps[0] == ("9 + 9 + 9 + 8", 35), f"Step 1 failed: {ex_steps[0]}"
    assert ex_steps[1] == ("3 + 5", 8), f"Step 2 failed: {ex_steps[1]}"

    print("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Generate random 4-digit numbers based on target digit sum (0-9)."
    )
    parser.add_argument("-t", "--target", type=int, choices=range(0, 10), help="Target digit total (0-9)")
    parser.add_argument("-c", "--count", type=int, default=1, help="Number of random numbers to generate (default: 1)")
    parser.add_argument("--all", action="store_true", help="List all matching numbers for the given target")
    parser.add_argument("--test", action="store_true", help="Run automated test suite and verification")

    args = parser.parse_args()

    if args.test:
        run_tests()
        return

    target = args.target
    if target is None:
        try:
            val_input = input("Enter target digit total (0 - 9): ").strip()
            if not val_input.isdigit() or not (0 <= int(val_input) <= 9):
                print("Error: Input must be a single digit between 0 and 9.", file=sys.stderr)
                sys.exit(1)
            target = int(val_input)
        except (KeyboardInterrupt, EOFError):
            print("\nOperation cancelled.")
            sys.exit(0)

    if args.all:
        matches = get_all_matching_4digits(target)
        print(f"\nAll {len(matches)} 4-digit numbers matching target digit {target}:")
        print(", ".join(matches))
        return

    print(f"\nGenerating {args.count} random 4-digit number(s) for target digit {target}:")
    print("-" * 55)

    for i in range(1, args.count + 1):
        num_str = generate_random_4digit(target)
        print(f"\nResult #{i}: [{num_str}]")
        print(format_breakdown(num_str))

    print("-" * 55)


if __name__ == "__main__":
    main()
