import AsyncStorage from '@react-native-async-storage/async-storage';

test('AsyncStorage mock is wired up', async () => {
  await AsyncStorage.setItem('smoke-key', 'smoke-value');
  await expect(AsyncStorage.getItem('smoke-key')).resolves.toBe('smoke-value');
});
