// filepath: c:\Users\b1karmat\Desktop\github\Beadandok\13\dart\923\04.dart
void main() {
  int i = 1;
  
  while (i <= 100) {
    // If number is divisible by 3 or 5, skip it
    if (i % 3 == 0 || i % 5 == 0) {
      i++;
      continue;
    }
    
    // If not divisible by 3 or 5, print the number
    print(i);
    i++;
  }
}