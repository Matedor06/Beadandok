// filepath: c:\Users\b1karmat\Desktop\github\Beadandok\13\dart\923\03.dart
import 'dart:io';

void main() {
  int first = 0;
  int second = 1;
  
  print(first); // Print first Fibonacci number
  
  while (second <= 100) {
    print(second);
    int next = first + second;
    first = second;
    second = next;
  }
}