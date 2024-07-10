export const getDistinct = (array, pick) => {
   const sample = [];
   const arrayClone = [...array];

   for (var i = 0; i < pick; i++) {
      sample.push(arrayClone.splice(Math.random() * arrayClone.length, 1));
   }

   return sample.flat();
};

export const getRandomArbitrary = (min, max) => {
   return Math.random() * (max - min) + min;
};
