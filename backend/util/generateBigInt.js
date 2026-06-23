import FlakeId from 'flake-idgen';
import intformat from 'biguint-format';

const flake = new FlakeId();

const generateBigInt = () => {
  return intformat(flake.next(), 'dec');
};

export default generateBigInt;