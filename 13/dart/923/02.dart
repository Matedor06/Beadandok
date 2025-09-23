// filepath: c:\Users\b1karmat\Desktop\github\Beadandok\13\dart\923\02.dart
import 'dart:io';

void main() {
  print("Enter a number between 3 and 9:");
  int? userNumber = int.parse(stdin.readLineSync()!);
  
  if (userNumber >= 3 && userNumber <= 9) {
    int i = 0;
    
    outerLoop: while (i <= 10) {
      if (i == userNumber) {
        break outerLoop; // Exit outer loop when i reaches user number
      }
      
      int j = 0;
      while (j <= 10) {
        if (j == userNumber) {
          break; // Exit inner loop when j reaches user number
        }
        print('i = $i, j = $j');
        j++;
      }
      i++;
    }
  } else {
    print("Please enter a number between 3 and 9.");
  }
}