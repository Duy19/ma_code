# ma_code
Link to github page

https://duy19.github.io/ma_code/


Link zum tex repo

https://github.com/Duy19/masterthesis-tex

Todo: 

General:
- Migrate code because of url name later on
- Gescheitest framework damit Chapter in Zukunft leicht erweitert werden können => Done 
- Handbuch für framework (wie erweitern, wie es zu nutzen ist) folgt noch
- Auf feedback warten

Chapter1: 
- Chapter 1 thematically done. 

Chapter 2:
- Chapter 2 thematicall done.

Chapter3:
- Work on generating tasksets and Suspension (Chapter 3)
- Permutation of parameters
- Limit number of possible tasks (performance issues etc.)




Themen:
- Task Model and Parameters (periodic, (sporadic) WCET)
- CIT, TDA and other basic schedulability tests (utilization bounds)
- Scheduling Strategies (EDF, RM, DM, ...)
- Self-Suspension
- End-to-end latency

Meeting 05.01

   - Kapitel 1 und 2 bis zum nächsten Meeting fertig stellen
   - Erstmal Beispiele Hardcoden

   - Kapitel 1: Verschiedenste Scheduling Policies genauer betrachten.
      - Kleine Einführung, Matching (Normal und Reverse)

   - Kapitel 2: CIT und Worst Cases betrachten
      - Kleine Einführung und Beispiele dafür zur Veranschaulichung
    
      - Evtl. Matching zum Schluss

Ab ~ mitte Januar

   - Kapitel 3: Suspension und Co
      - Hier einige Beispiele Hardcoden
      - Worst Cases generieren ist hier schwieriger daher erstmal nur Kapitel 1 & 2

   - Taskset Generierung durch Mutation der Parameter

Generell

   - Schreiben!
   - Hier und da Oberfläche etc. Anpassen für User



Meeting 19.01

   - Mehr zum Inhalt für CIT besprechen (Utilization Bounds und dann Bespiel?, TDA?) 
   - Wie sollte man mehrdeutige Schedules (EDF) behandeln? -> Fixer Tie-Break und vorher sagen. Trotzdem für später alle optionen offen lassen, implementierung zu merhdeutigen drin lassen.


Meeting 02.02

   - Aus der Survey passen Logic-Puzzles am besten zum Matching Game (Parameter herausfinden)
   - Spieler versucht anhand der Hinweise (Schedule) die Paramter (logisch) abzuleiten
   - Anders herum eher Path-Building Puzzles aber auch nicht ganz?
   - Aber Grundprintip ist die Taskgeneration unter gewissen constraints! (Taskparameter, feasability, Algorithm used)
   - Keyword: constraint based procedural generation?
   - Für Logic Puzzles werden GA, BFS (heuristic), ASP, GA + solver für fitness function


   Quellen für logic-puzzles und die constrained base generation bzw. constrained satisfaction problems (CSP)
   - Quellen mit Constraint-basierte Generierung  7, 9, 10, 32, 34
   - Logic-Puzzle Quellen 48–54