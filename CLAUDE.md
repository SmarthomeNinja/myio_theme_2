A projekt célja, kontextusa : 
    - myIO server , okos otthon vezérlő.
    - ezzel a szerverrel lhet egy böngésző felületén kommunikálni.
    - a szerver kiszolgálja a HTML file-t, a szükésges változókat kitölti frissítéskor. feltöltöttem egy minta HTML file-t (/html_sample.html), ha valamiért szükséged lenne rá.
    - ez a html a szerver verziójától függően eldönti, hogy a további file-okat melyik könyvtárból kell tölteni (/js/2.5, vagy a /js/3.5).
    - most a 3.5-öt fejlesztjük, tehát erre a könyvtárra fókuszálj. /js/3.5
    - jelenleg a főoldal-t fejlesztjük. 
    - Ehhez tartozik nav.js, ami a fejlécet csinálja meg. ez tartalmaz egy  menüt, amiben vannak különböző elemek, illetve a tetején 2 gomb, amik elnavigálnak másik oldalakra (/setup és /chart), ezeket hagyd figyelmen kívül. csak a menü többi elemére fókuszálj.
    - illetve tartozik egy index.js, ami a lényeg. itt találhatóak az okos otthonban beállított eszközök, lehetőségek megjelenített kártyái, szekciókba rendezve.
    - a szekciók és a kártyák a szekciókon belül áthelyezhetőek. drag&pull 
    - a kártyák elnevezésének push-eventre megnyílik a kártyához tartozó modal, ahol különböző beállításokat lehet eszközölni. A módosítások a böngésző tárhelyére kerülnek.
    - a szenzor kártyák elnevezésére kattintva előjön a chart modal.
    - az auto refresh bekapcsolt állapota után a megadott időközönként a háttérben a változók adatait frissíti egy /sens_out.json letöltésével, ehhez feltöltöttem egy mintát a /sens_out.json file-ba.
    
    - a project a myio.local címen futó szerveren elérhető böngészőből., ha nincs megnyitva, akkor, miután megnyitod developer tool-st nyisd meg, hogy a disable cache be legyen pipálva.

    

