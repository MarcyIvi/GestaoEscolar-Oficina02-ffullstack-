/*
  Warnings:

  - You are about to drop the column `disciplina` on the `Boletim` table. All the data in the column will be lost.
  - You are about to drop the column `nota` on the `Boletim` table. All the data in the column will be lost.
  - You are about to drop the column `idade` on the `Professor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boletim" DROP COLUMN "disciplina",
DROP COLUMN "nota",
ADD COLUMN     "artes" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ciencias" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "educacao_fisica" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "filosofia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "geografia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "historia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "matematica" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "portugues" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "idade";
