import BrutalButton from "../ButtonComponent/ButtonComponent";
import { BrutalInput } from "../InputComponent/InputComponent";

interface FilterFormProps {
  filter: string;
  setFilter: (value: string) => void;
  handleFilter: () => void;
}

export function FilterForm({
  filter,
  setFilter,
  handleFilter,
}: FilterFormProps) {
  return (
    <div>
      <label className="font-bold block mb-1">Filtrar grafo:</label>
      <BrutalInput
        type="text"
        placeholder="Ingrese criterio de filtrado"
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.target.value)
        }
        className="w-full p-2 border-4 border-black rounded-lg"
      />
      <BrutalButton
        onClick={handleFilter}
        variant="green"
        className="mt-2 w-full"
      >
        Aplicar Filtro
      </BrutalButton>
    </div>
  );
}
