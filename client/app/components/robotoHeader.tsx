import { Heading, Text } from '@chakra-ui/react';
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const RobotoHeader = ({ children, ...props }: { children: React.ReactNode } & React.ComponentProps<typeof Heading>) => (
  <Text {...props} className={robotoMono.className} fontSize="2xl" fontWeight="bold">
    {children}
  </Text>
);

export default RobotoHeader;
