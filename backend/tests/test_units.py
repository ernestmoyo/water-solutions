"""Unit conversion tests."""

from app.utils.units import convert_unit


def test_ls_to_m3h():
    result = convert_unit(10, "L/s", "m³/h")
    assert result == 36.0


def test_m3h_to_ls():
    result = convert_unit(36, "m³/h", "L/s")
    assert result == 10.0


def test_bar_to_psi():
    result = convert_unit(1, "bar", "psi")
    assert result is not None
    assert abs(result - 14.5038) < 0.001


def test_same_unit():
    result = convert_unit(42, "bar", "bar")
    assert result == 42


def test_unknown_conversion():
    result = convert_unit(1, "kg", "lb")
    assert result is None
