JSON = dict[str, 'JSON'] | list['JSON'] | str | int | float | bool | None

def loads(__s: str) -> JSON: ...
def dumps(__o: JSON, *, indent = 0) -> str: ...
