import 'dart:io';

void main() {
    stdout.write('Add meg a teszt össz pontszámát: ');
    int? maxPont = int.tryParse(stdin.readLineSync()!);

    stdout.write('Add meg az elért pontot: ');
    int? elertPont = int.tryParse(stdin.readLineSync()!);

    if (maxPont == null || elertPont == null || maxPont <= 0 || elertPont < 0 || elertPont > maxPont) {
        print('Hibás adatbevitel.');
        return;
    }

    double szazalek = (elertPont / maxPont) * 100;

    String ertekeles;
    if (szazalek >= 90 && szazalek < 100) {
        ertekeles = 'A';
    } else if (szazalek >= 80 && szazalek < 90) {
        ertekeles = 'B';
    } else if (szazalek >= 70 && szazalek < 80) {
        ertekeles = 'C';
    } else if (szazalek >= 60 && szazalek < 70) {
        ertekeles = 'D';
    } else if (szazalek >= 50 && szazalek < 60) {
        ertekeles = 'E';
    } else if (szazalek >= 0 && szazalek < 50) {
        ertekeles = 'F';
    } else if (szazalek == 100) {
        ertekeles = 'A';
    } else {
        ertekeles = 'Hibás százalékérték';
    }

    print('Elért százalék: ${szazalek.toStringAsFixed(2)}%');
    print('Értékelés: $ertekeles');
}