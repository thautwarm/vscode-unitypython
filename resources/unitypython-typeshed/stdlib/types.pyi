from typing import (
    Any,
    AsyncGenerator as AsyncGeneratorType,
    Callable,
    Coroutine,
    Generator,
    TypeVar,
    overload,
    # Awaitable,
    # Generic,
    # ItemsView,
    # Iterable,
    # Iterator,
    # KeysView,
    # Mapping,
    # MutableSequence,
    # ValuesView,
)
from typing_extensions import Literal, final

TracebackType = type(None)

__all__ = [
    "FunctionType",
    "LambdaType",
    "GeneratorType",
    "CoroutineType",
    "AsyncGeneratorType",
    "MethodType",
    "BuiltinFunctionType",
    "BuiltinMethodType",
    "ModuleType",
    "UnionType",
    "NoneType",
]

# Note, all classes "defined" here require special handling.

_T1 = TypeVar("_T1")
_T2 = TypeVar("_T2")
_T_co = TypeVar("_T_co", covariant=True)
_T_contra = TypeVar("_T_contra", contravariant=True)
_KT = TypeVar("_KT")
_VT_co = TypeVar("_VT_co", covariant=True)
_V_co = TypeVar("_V_co", covariant=True)

FunctionType = function

LambdaType = FunctionType

class ModuleType:
    __name__: str
    # __file__: str | None
    @property
    def __dict__(self) -> dict[str, Any]: ...  # type: ignore[override]
    # __loader__: _LoaderProtocol | None
    # __package__: str | None
    # __path__: MutableSequence[str]
    # __spec__: ModuleSpec | None
    # def __init__(self, name: str, doc: str | None = ...) -> None: ...
    # __getattr__ doesn't exist at runtime,
    # but having it here in typeshed makes dynamic imports
    # using `builtins.__import__` or `importlib.import_module` less painful
    # def __getattr__(self, name: str) -> Any: ...

GeneratorType = Generator

CoroutineType = Coroutine

class _StaticFunctionType:
    # Fictional type to correct the type of MethodType.__func__.
    # FunctionType is a descriptor, so mypy follows the descriptor protocol and
    # converts MethodType.__func__ back to MethodType (the return type of
    # FunctionType.__get__). But this is actually a special case; MethodType is
    # implemented in C and its attribute access doesn't go through
    # __getattribute__.
    # By wrapping FunctionType in _StaticFunctionType, we get the right result;
    # similar to wrapping a function in staticmethod() at runtime to prevent it
    # being bound as a method.
    def __get__(self, obj: object | None, type: type | None) -> FunctionType: ...

@final
class MethodType:
    @property
    def __func__(self) -> _StaticFunctionType: ...
    @property
    def __self__(self) -> object: ...
    def __init__(self, __func: Callable[..., Any], __obj: object) -> None: ...
    def __call__(self, *args: Any, **kwargs: Any) -> Any: ...

@final
class BuiltinFunctionType:
    @property
    def __self__(self) -> object | ModuleType: ...
    @property
    def __name__(self) -> str: ...
    # @property
    # def __qualname__(self) -> str: ...
    def __call__(self, *args: Any, **kwargs: Any) -> Any: ...

BuiltinMethodType = BuiltinFunctionType


# def prepare_class(
#     name: str, bases: tuple[type, ...] = ..., kwds: dict[str, Any] | None = ...
# ) -> tuple[type, dict[str, Any], dict[str, Any]]: ...

# Actually a different type, but `property` is special and we want that too.
# DynamicClassAttribute = property

_Fn = TypeVar("_Fn", bound=Callable[..., object])
_R = TypeVar("_R")
# _P = ParamSpec("_P")

# it's not really an Awaitable, but can be used in an await expression. Real type: Generator & Awaitable
# The type: ignore is due to overlapping overloads, not the use of ParamSpec
# @overload
# def coroutine(func: Callable[_P, Generator[_R, Any, Any]]) -> Callable[_P, Awaitable[_R]]: ...  # type: ignore[misc]
# @overload
# def coroutine(func: _Fn) -> _Fn: ...

# if sys.version_info >= (3, 8):
#     pass


class GenericAlias:
    # @property
    # def __origin__(self) -> type: ...
    # @property
    # def __args__(self) -> tuple[Any, ...]: ...
    # @property
    # def __parameters__(self) -> tuple[Any, ...]: ...
    def __init__(self, origin: type, args: Any) -> None: ...
    def __getattr__(self, name: str) -> Any: ...  # incomplete
    def __getitem__(self, *cls: type) -> type: ...


@final
class NoneType:
    def __bool__(self) -> Literal[False]: ...
# EllipsisType = ellipsis  # noqa F811 from builtins
# from builtins import _NotImplementedType

# NotImplementedType = _NotImplementedType  # noqa F811 from builtins
@final
class UnionType:
    def __or__(self, __obj: Any) -> UnionType: ...
