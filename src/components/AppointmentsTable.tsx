import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Paper
} from "@mui/material";

const columnHelper = createColumnHelper<any>();

export default function AppointmentsTable({ appointments }: any) {
  const columns = [
    columnHelper.accessor("patient", {
      header: "Paciente",
    }),
    columnHelper.accessor("date", {
      header: "Fecha",
    }),
  ];

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Paper sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableCell key={header.id}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{cell.getValue()}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}