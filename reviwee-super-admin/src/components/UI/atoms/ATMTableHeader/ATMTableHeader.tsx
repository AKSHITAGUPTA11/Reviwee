import { BiFilter, BiSearch } from 'react-icons/bi';

type Props = {
    rowsPerPage: number;
    page: number;
    rows: any[];
    rowCount: number;
    rowsPerPageOptions?:number[];
    onRowsPerPageChange?: (newValue: number)=> void;
    isFilter?:boolean,
    onFilterClick?: ()=> void;
}

const ATMTableHeader = ({
    rowCount,
    rows,
    rowsPerPage,
    page,
    rowsPerPageOptions = [5, 10, 20, 50, 100],
    onRowsPerPageChange= ()=> { },
    isFilter = false,
    onFilterClick= ()=> {}
    
}: Props) => {



  return (
    <div className="p-3 border-b border-slate-300 grid grid-cols-2">

         {/* Left */}
          <div className="flex gap-1">
            <div className="border w-fit rounded flex shadow items-center p-1 hover:border-primary-main">
              <BiSearch className="text-slate-600 text-xl" />
              <input
                className="border-none rounded outline-none px-2 w-[200px] placeholder:text-slate-500"
                value=""
                onChange={() => {}}
                placeholder="Search..."
              />
            </div>

            {
             isFilter &&
            <button
            onClick={()=> onFilterClick() }
            className="bg-white shadow px-2 flex items-center rounded border">
              <BiFilter className="text-2xl text-slate-600" />
            </button>
            }
          </div>

          {/* Right */}
          <div className="flex justify-end " >
            <div className="flex gap-3 items-center">
              <div className="text-sm"> Rows per page : </div>
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
                className={`rounded-lg p-1 outline-0 bg-slate-100 text-sm `}
              >
                {rowsPerPageOptions.map((option) => {
                  return (
                    <option key={option} value={option}>
                      {" "}
                      {option}{" "}
                    </option>
                  );
                })}
              </select>

              <div className="text-sm bg-slate-100 py-1 px-2 rounded-lg text-slate-600">
                Showing &nbsp; {(rowsPerPage * (page - 1)) + 1} - {(rowsPerPage * (page - 1)) + rows.length} of {rowCount}
              </div>
            </div>
          </div>

        </div>
  )
}

export default ATMTableHeader