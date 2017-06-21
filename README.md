# LOSdiet
###### _All of that LineageOS taste without the filling_  

Generate flashable zip to remove system apps from LineageOS 13/14 within the browser.    

## WARNING!!!!
**Very alpha stage**.  The list was created mainly from the [old Cyanogenmod Barebones list](http://web.archive.org/web/20161225102927/https://wiki.cyanogenmod.org/w/Barebones) and therefore probably wrong/out of date.  If you do not know what you are doing, for the love of god and all that is holy...do not use this.

![](youll_shoot_your_eye_out.gif)

## Why?
Some of the stock apps and libraries I do not use and ,personally, I prefer a system that is lean.  For example, I use [Vanilla Music](https://github.com/vanilla-music/vanilla) so Eleven, a.k.a. Music, just clutters up the app drawer.

## How does it work?
After selecting the system apps to be removed, 'Make Zip' creates a simple bash script that is injected into a flashable zip file.  This bash script is added to start up scripts under `/system/addon.d/20-LOSdiet.sh`.  The script is run once when flashing the zip and again every boot. This prevents applications from being readded when Lineage updates

## Help! Help! I did not heed your warning
Ugh, no one ever listens to pearls of wisdom.

1. Download the [flashable uninstall zip file](https://thrilleratplay.github.io/LOSdiet/zips/LOSdiet-uninstall.zip)
2. Flash it.
3. Reflash the LineageOS ROM for your device.


## credits
* Heavily influenced by and based on [Freecyngn](https://github.com/nvllsvm/freecyngn)  
