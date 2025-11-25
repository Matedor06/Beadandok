void main() {
  print('=== Dart Lista Feladatok ===\n');
  
  // 1. fixList létrehozása - 10 elemű lista 0-kkal, páratlan indexeken 1-esek
  print('1. fixList létrehozása:');
  List<int> fixList = List.filled(10, 0);
  for (int i = 1; i < fixList.length; i += 2) {
    fixList[i] = 1;
  }
  print('fixList: $fixList\n');

  // 2. list létrehozása - páros indexeken 1, páratlan indexeken 0
  print('2. list létrehozása:');
  List<int> list = [];
  for (int i = 0; i < 10; i++) {
    list.add(i % 2 == 0 ? 1 : 0);
  }
  print('list: $list\n');

  // 3. fiboList létrehozása - Fibonacci számok 30-nál kisebbek
  print('3. fiboList létrehozása (Fibonacci számok < 30):');
  List<int> fiboList = [];
  int a = 0, b = 1;
  while (a < 30) {
    fiboList.add(a);
    int temp = a + b;
    a = b;
    b = temp;
  }
  print('fiboList: $fiboList\n');

  // 4. fiboList különböző műveletek
  print('4. fiboList műveletek:');
  print('Hossza: ${fiboList.length}');
  print('Első elem: ${fiboList.first}');
  print('Utolsó elem: ${fiboList.last}');
  print('3-as indexű elem: ${fiboList[3]}');
  if (fiboList.length > 8) {
    print('8-as indexű elem: ${fiboList[8]}');
  } else {
    print('8-as indexű elem: Nincs ilyen elem (lista túl rövid)');
  }
  print('Fordított sorrend: ${fiboList.reversed.toList()}');
  print('Nem üres-e: ${fiboList.isNotEmpty}');
  
  // Töröljük az összes elemet
  fiboList.clear();
  print('Törlés után üres-e: ${fiboList.isEmpty}');
  
  // Adjuk hozzá a 34-et
  fiboList.add(34);
  print('34 hozzáadva: $fiboList');
  
  // Adjuk hozzá a [1, 2, 3, 5, 7] listát
  fiboList.addAll([1, 2, 3, 5, 7]);
  print('[1, 2, 3, 5, 7] hozzáadva: $fiboList');
  
  // Szúrjuk be a 34 után a [0, 1] listát
  int index34 = fiboList.indexOf(34);
  if (index34 != -1) {
    fiboList.insertAll(index34 + 1, [0, 1]);
  }
  print('34 után [0, 1] beszúrva: $fiboList');
  
  // Cseréljük le az utolsó elemet [8, 13, 21] listára
  if (fiboList.isNotEmpty) {
    fiboList.removeLast();
    fiboList.addAll([8, 13, 21]);
  }
  print('Utolsó elem lecserélve [8, 13, 21]-re: $fiboList');
  
  // Töröljük az első elemet
  if (fiboList.isNotEmpty) {
    fiboList.removeAt(0);
  }
  print('Első elem törölve: $fiboList\n');

  // 5. fiboSquare lista létrehozása - fiboList elemeinek négyzetei
  print('5. fiboSquare létrehozása (fiboList elemeinek négyzetei):');
  List<int> fiboSquare = fiboList.map((x) => x * x).toList();
  print('fiboSquare: $fiboSquare\n');

  // 6. allFibo lista - fiboList és fiboSquare páratlan elemei csökkenő sorrendben
  print('6. allFibo létrehozása (páratlan elemek csökkenő sorrendben):');
  List<int> allFibo = [];
  
  // Páratlan elemek a fiboList-ből
  allFibo.addAll(fiboList.where((x) => x % 2 == 1));
  
  // Páratlan elemek a fiboSquare-ből
  allFibo.addAll(fiboSquare.where((x) => x % 2 == 1));
  
  // Csökkenő sorrend
  allFibo.sort((a, b) => b.compareTo(a));
  
  print('allFibo: $allFibo');
}
