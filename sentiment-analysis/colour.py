import cmocean
import matplotlib


def sentiment_to_colour(number):
    value = (number + 1) / 2
    cmap = cmocean.cm.thermal
    colour = cmap(value)
    rgb = colour[:3]  # will return rgba, we take only first 3 so we get rgb
    return matplotlib.colors.rgb2hex(rgb)
