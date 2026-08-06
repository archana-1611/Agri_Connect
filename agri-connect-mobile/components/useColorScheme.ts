import { useColorScheme as useColorSchemeCore } from 'react-native';

export const useColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  if (!coreScheme || (coreScheme as string) === 'unspecified') {
    return 'light';
  }
  return coreScheme as 'light' | 'dark';
};
