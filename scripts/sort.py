import re
import aegis


def is_uppercase(name: str) -> bool:
    return name.isupper()


def is_camelcase(name: str) -> bool:
    return bool(re.match(r"[A-Z][a-zA-Z0-9]*$", name))


def sort_isort_style(names: list[str]) -> list[str]:
    names = sorted(names)  # fallback alphabetical sort
    uppercase = sorted([n for n in names if is_uppercase(n)])
    camelcase = sorted([n for n in names if is_camelcase(n) and not is_uppercase(n)])
    lowercase = sorted(
        [n for n in names if not is_uppercase(n) and not is_camelcase(n)]
    )
    return uppercase + camelcase + lowercase


# Example:
names = [n for n in dir(aegis) if not n.startswith("_")]

sorted_names = sort_isort_style(names)

print("__all__ = [")
for name in sorted_names:
    print(f'    "{name}",')
print("]")
