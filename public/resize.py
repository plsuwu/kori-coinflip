#!/usr/bin/env python

import os
import re
from PIL import Image
from typing import Dict, Tuple

e_resize_dict: Dict[str, Image.Image] = {}
d_resize_dict: Dict[str, Image.Image] = {}
DIRS = ["disabled", "enabled"]

def save_img(base_path: str, imgs: list[Dict[str, Image.Image]]) -> None:
    for i in imgs:
        for (name, func) in i.items():
            filepath = f"{base_path}{name}"
            # print(filepath)
            func.save(filepath)

    return

def get_sizes(dir: Dict[str, str], regex_type: str) -> Tuple[list[Dict[str, Image.Image]], str]:
    res = []
    res_dict: Dict[str, Image.Image] = {}

    for (name, path) in dir.items():
        img = Image.open(path)
        filename_parts = re.split(rf"_{regex_type[0]}(\d*)-(\d+)\.png", name)[:-1]
        (base_name, num, size) = (filename_parts[0], filename_parts[1], filename_parts[2])

        if len(num) < 2:
            num = f"0{num}"

        new_name_128 = f"{base_name.upper()}{num}_{size}x{size}.png"
        resize_48 = img.resize((48, 48))
        resize_32 = img.resize((32, 32))
        resize_16 = img.resize((16, 16))

        new_48 = f"{base_name.upper()}{num}_48x48.png"
        new_32 = f"{base_name.upper()}{num}_32x32.png"
        new_16 = f"{base_name.upper()}{num}_16x16.png"

        entry_dict = {}
        entry_dict.update({ new_48: resize_48 })
        entry_dict.update({ new_32: resize_32 })
        entry_dict.update({ new_16: resize_16 })
        entry_dict.update({ 'new_128': new_name_128 })
        res.append(entry_dict)

    return (res, new_name_128)


def rename_img(img: Dict[str, str], pwd: str) -> None:
    for (name, path) in img.items():
        new_filepath = f"{pwd}/{img}"

        print(path, new_filepath)
        # os.rename(path, new_name)





pwd = os.getcwd()
# pwd = f"{pwd}/OLD"

# enabled
E = {
    f: f"{pwd}/{DIRS[1]}/OLD/{f}"
    for f in os.listdir(pwd + "/" + DIRS[0] + "/OLD/")
    if f.__contains__(".png")
}

# disabled
D = {
    f: f"{pwd}/{DIRS[0]}/OLD/{f}"
    for f in os.listdir(pwd + "/" + DIRS[0] + "/OLD/")
    if f.__contains__(".png")
}

# old_e = f"{pwd}/{DIRS[1]}"
# old_d = f"{pwd}/{DIRS[0]}"
# rename_img(E, old_e)
# rename_img(D, old_d)

# sizes_en = get_sizes(E, 'enabled')
# sizes_ds = get_sizes(D, 'disabled')
#
# save_img(f"{pwd}/{DIRS[1]}/", sizes_en[0])
# save_img(f"{pwd}/{DIRS[0]}/", sizes_ds[0])
#
# rename_img(E, pwd, sizes_en[1])
# rename_img(D, pwd, sizes_ds[1])

# for (name, path) in E.items():
#     img = Image.open(path)
#     no_ext = re.split(r"_e(\d*)-(\d+)\.png", name)[:-1]
#     (base_name, num, size) = (no_ext[0], no_ext[1], no_ext[2])
#     if len(num) < 2:
#         num = f"0{num}"
#
#     resize_48 = img.resize((48, 48))
#     resize_32 = img.resize((32, 32))
#     resize_16 = img.resize((16, 16))
#
#     new_name_128 = f"enabled_{base_name.upper()}{num}_{size}.png"
#
#     new_48 = f"enabled_{base_name.upper()}{num}_48.png"
#     new_32 = f"enabled_{base_name.upper()}{num}_32.png"
#     new_16 = f"enabled_{base_name.upper()}{num}_16.png"
#
#     e_resize_dict.update({ new_48: resize_48 })
#     e_resize_dict.update({ new_32: resize_32 })
#     e_resize_dict.update({ new_16: resize_16 })
#
# print(e_resize_dict)

