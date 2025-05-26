# Obtenir des tuiles 3D

Salut Karl, voici un mini tuto pour bien obtenir des tuiles 3D :)

## Installer Conda (si pas déjà fait)

je te recommande de suivre la doc officielle: [Installer Conda sur Windows](https://docs.conda.io/projects/conda/en/latest/user-guide/install/windows.html)

## Installer et Utiliser le package PDAL

### Installation:

Ouvre le terminal Conda et entre ceci: 

```
conda create --yes --name myenv --channel conda-forge pdal
```

Tu devrais obtenir quelque chose comme ceci: (attention ça peut prendre un peu de temps):

```
Solving environment: done

## Package Plan ##

  environment location: C:\Miniconda3\envs\myenv

  added / updated specs:
    - pdal


The following packages will be downloaded:

    package                    |            build
    ---------------------------|-----------------
    pdal-1.7.2                 |   py35h33f895e_1         8.6 MB  conda-forge
    setuptools-39.2.0          |           py35_0         591 KB  conda-forge
    numpy-1.14.3               |   py35h9fa60d3_2          42 KB
    ------------------------------------------------------------
                                           Total:         9.2 MB

The following NEW packages will be INSTALLED:

    boost:           1.66.0-py35_vc14_1    conda-forge [vc14]
    boost-cpp:       1.66.0-vc14_1         conda-forge [vc14]
    ca-certificates: 2018.4.16-0           conda-forge
    cairo:           1.14.10-vc14_0        conda-forge [vc14]
    certifi:         2018.4.16-py35_0      conda-forge
    curl:            7.60.0-vc14_0         conda-forge [vc14]
    expat:           2.2.5-vc14_0          conda-forge [vc14]
    flann:           1.9.1-h0953f56_2      conda-forge
    freexl:          1.0.5-vc14_0          conda-forge [vc14]
    geotiff:         1.4.2-vc14_1          conda-forge [vc14]
    hdf4:            4.2.13-vc14_0         conda-forge [vc14]
    hdf5:            1.10.1-vc14_2         conda-forge [vc14]
    hexer:           1.4.0-vc14_1          conda-forge [vc14]
    icc_rt:          2017.0.4-h97af966_0
    icu:             58.2-vc14_0           conda-forge [vc14]
    intel-openmp:    2018.0.3-0
    jpeg:            9b-vc14_2             conda-forge [vc14]
    kealib:          1.4.7-vc14_4          conda-forge [vc14]
    krb5:            1.14.6-vc14_0         conda-forge [vc14]
    laszip:          3.2.2-vc14_0          conda-forge [vc14]
    laz-perf:        1.2.0-vc14_1          conda-forge [vc14]
    libgdal:         2.2.4-vc14_4          conda-forge [vc14]
    libiconv:        1.15-vc14_0           conda-forge [vc14]
    libnetcdf:       4.6.1-vc14_2          conda-forge [vc14]
    libpng:          1.6.34-vc14_0         conda-forge [vc14]
    libpq:           9.6.3-vc14_0          conda-forge [vc14]
    libspatialite:   4.3.0a-vc14_19        conda-forge [vc14]
    libssh2:         1.8.0-vc14_2          conda-forge [vc14]
    libtiff:         4.0.9-vc14_0          conda-forge [vc14]
    libxml2:         2.9.8-vc14_0          conda-forge [vc14]
    libxslt:         1.1.32-vc14_0         conda-forge [vc14]
    mkl:             2018.0.3-1
    mkl_fft:         1.0.2-py35_0          conda-forge
    mkl_random:      1.0.1-py35_0          conda-forge
    nitro:           2.7.dev2-vc14_0       conda-forge [vc14]
    numpy:           1.14.3-py35h9fa60d3_2
    numpy-base:      1.14.3-py35h5c71026_0
    openjpeg:        2.3.0-vc14_2          conda-forge [vc14]
    openssl:         1.0.2o-vc14_0         conda-forge [vc14]
    pcl:             1.8.1-hd76163c_1      conda-forge
    pdal:            1.7.2-py35h33f895e_1  conda-forge
    pip:             9.0.3-py35_0          conda-forge
    pixman:          0.34.0-vc14_2         conda-forge [vc14]
    postgresql:      10.3-py35_vc14_0      conda-forge [vc14]
    proj4:           4.9.3-vc14_5          conda-forge [vc14]
    python:          3.5.5-1               conda-forge
    setuptools:      39.2.0-py35_0         conda-forge
    sqlite:          3.20.1-vc14_2         conda-forge [vc14]
    tiledb:          1.4.1                 conda-forge
    vc:              14-0                  conda-forge
    vs2015_runtime:  14.0.25420-0          conda-forge
    wheel:           0.31.0-py35_0         conda-forge
    wincertstore:    0.2-py35_0            conda-forge
    xerces-c:        3.2.0-vc14_0          conda-forge [vc14]
    xz:              5.2.3-0               conda-forge
    zlib:            1.2.11-vc14_0         conda-forge [vc14]

Downloading and Extracting Packages
pdal-1.7.2           |  8.6 MB | ###################################### | 100%
setuptools-39.2.0    |  591 KB | ###################################### | 100%
numpy-1.14.3         |   42 KB | ###################################### | 100%
Preparing transaction: done
Verifying transaction: done
Executing transaction: done
#
# To activate this environment, use
#
#     $ conda activate myenv
#
# To deactivate an active environment, use
#
#     $ conda deactivate
```

Au cas où tu peux exécuter cette ligne de commade pour être sur de l'installation:

```
conda install --name myenv --channel conda-forge pdal
```

Ensuite il faut se placer sur le bon environnement car tu es par défaut sur `base`, hors PDAL est sur l'environnement `myenv` qu'on vient de créer et initialiser. Pour ce faire entre ceci:

```
conda activate myenv
```

### Utilisation:

C'est bon tu es sur le bon environnement ! Tu vas pouvoir entrer cette ligne de commande:

```
pdal translate "Chemin\vers\fichier\nkh_eboulement_diego_laz12_3857.laz" "Chemin\du\nouveau\fichier\nkh_EPSG_3857.las"
```

**Attention**: Utilise un nuage de point en EPSG:3857.

Maintenant que tu as le fichier au format LAS tu vas pouvoir créer tes tuiles 3D.

## Installer et Utiliser l'outil gocesiumtiler

### Installation

Tout d'abord installe le fichier zip de ce dépôt github: [GoCesiumTiler Release GitHub](https://github.com/mfbonfigli/gocesiumtiler/releases/tag/v2.0.1)

Ensuite dans ta zone de téléchargement en local dézip le dossier en **vérifiant bien** que le dossier share se trouve dans le même dossier que le .exe sinon cela causera des problèmes.



### Utilisation

Créé un dossier s'appellant: `3857` où tu veux.

Ouvre un terminal dans le dossier où se trouve ton fichier .exe. Normalement le .exe s'appelle comme ceci: `gocesiumtiler-win-x64.exe`.

Dans le terminal entre cette ligne de commande:

```
gocesiumtiler-win-x64.exe file -o Chemin\vers\dossier\3857 -e 3857 Chemin\vers\fichier\nkh_EPSG_3857.las
```

**Attention**: Si ton .exe est différent utilise ce .exe comme commande interne.

En lancant tu devrais obtenir ceci:

```
                           _                 _   _ _
  __ _  ___   ___ ___  ___(_)_   _ _ __ ___ | |_(_) | ___ _ __
 / _  |/ _ \ / __/ _ \/ __| | | | | '_   _ \| __| | |/ _ \ '__|
| (_| | (_) | (_|  __/\__ \ | |_| | | | | | | |_| | |  __/ |
 \__, |\___/ \___\___||___/_|\__,_|_| |_| |_|\__|_|_|\___|_|
  __| | A Cesium Point Cloud tile generator written in golang
 |___/  Copyright 2025 - Massimo Federico Bonfigli
        build: 2.0.1-adb1649fb86503f4985e9a84388fee2566021b06


*** Mode: File, process LAS file at C:\PointCloud\nkh_EPSG_3857.las
*** Execution settings:
- Source CRS: 3857,
- Max Depth: 10,
- Resolution: 20.000000 meters,
- Min Points per tile: 5000
- Z-Offset: 0.000000 meters,
- 8Bit Color: false
- Join Clouds: false
- Tileset Version: 1.0

[2025-05-20 22:33:01.281] [C:\PointCloud\nkh_EPSG_3857.las] start reading las
[2025-05-20 22:33:01.287] [C:\PointCloud\nkh_EPSG_3857.las] las header read completed: found 4122844 points
[2025-05-20 22:33:01.288] [C:\PointCloud\nkh_EPSG_3857.las] crs: EPSG:3857
[2025-05-20 22:33:01.288] [C:\PointCloud\nkh_EPSG_3857.las] point loading started
[2025-05-20 22:33:03.002] [C:\PointCloud\nkh_EPSG_3857.las] point loading completed
[2025-05-20 22:33:03.002] [C:\PointCloud\nkh_EPSG_3857.las] build started
[2025-05-20 22:33:03.174] [C:\PointCloud\nkh_EPSG_3857.las] build completed
[2025-05-20 22:33:03.174] [C:\PointCloud\nkh_EPSG_3857.las] export started
[2025-05-20 22:33:04.073] [C:\PointCloud\nkh_EPSG_3857.las] export completed in 2.7920153s seconds
```

Normalement dans ton dossier `3857` tu devrais avoir une arborescence semblable à ceci:

```
3857
 ┣ 0
 ┃ ┣ 1
 ┃ ┃ ┣ 2
 ┃ ┃ ┃ ┣ 7
 ┃ ┃ ┃ ┃ ┣ 5
 ┃ ┃ ┃ ┃ ┃ ┗ content.pnts
 ┃ ┃ ┃ ┃ ┣ content.pnts
 ┃ ┃ ┃ ┃ ┗ tileset.json
 ┃ ┃ ┃ ┣ content.pnts
 ┃ ┃ ┃ ┗ tileset.json
 
 .
 .
 .

 ┃ ┣ 7
 ┃ ┃ ┣ 0
 ┃ ┃ ┃ ┣ 0
 ┃ ┃ ┃ ┃ ┣ 6
 ┃ ┃ ┃ ┃ ┃ ┗ content.pnts
 ┃ ┃ ┃ ┃ ┣ content.pnts
 ┃ ┃ ┃ ┃ ┗ tileset.json
 ┃ ┃ ┃ ┣ content.pnts
 ┃ ┃ ┃ ┗ tileset.json
 ┃ ┃ ┣ content.pnts
 ┃ ┃ ┗ tileset.json
 ┃ ┣ content.pnts
 ┃ ┗ tileset.json
 ┣ content.pnts
 ┗ tileset.json
```

Copie ce dossier dans le projet `poc-sig-3d` au chemin suivant:

```
poc-sig-3d/public/assets/
```

Et voilà tu peux visualiser tes tuiles 3D dans le POC `3D Tiles`.