"""Water measurement unit conversions."""


def liters_per_second_to_cubic_meters_per_hour(ls: float) -> float:
    return ls * 3.6


def cubic_meters_per_hour_to_liters_per_second(m3h: float) -> float:
    return m3h / 3.6


def bar_to_psi(bar: float) -> float:
    return bar * 14.5038


def psi_to_bar(psi: float) -> float:
    return psi / 14.5038


def cubic_meters_to_liters(m3: float) -> float:
    return m3 * 1000


def liters_to_cubic_meters(l: float) -> float:
    return l / 1000


def meters_to_feet(m: float) -> float:
    return m * 3.28084


def celsius_to_fahrenheit(c: float) -> float:
    return (c * 9 / 5) + 32


# Conversion registry
CONVERSIONS = {
    ("L/s", "m³/h"): liters_per_second_to_cubic_meters_per_hour,
    ("m³/h", "L/s"): cubic_meters_per_hour_to_liters_per_second,
    ("bar", "psi"): bar_to_psi,
    ("psi", "bar"): psi_to_bar,
    ("m³", "L"): cubic_meters_to_liters,
    ("L", "m³"): liters_to_cubic_meters,
    ("m", "ft"): meters_to_feet,
    ("°C", "°F"): celsius_to_fahrenheit,
}


def convert_unit(value: float, from_unit: str, to_unit: str) -> float | None:
    """Convert a value between units. Returns None if conversion not supported."""
    if from_unit == to_unit:
        return value
    converter = CONVERSIONS.get((from_unit, to_unit))
    if converter:
        return round(converter(value), 4)
    return None
