import { Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const professionals = [
  { id: 1, name: "admin" },
  { id: 2, name: "juan" },
  { id: 3, name: "ana" },
];

export default function ProfessionalSelect() {
  const navigate = useNavigate();
  const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");

  const handleSelect = (professional: any) => {
    localStorage.setItem("selectedProfessional", JSON.stringify(professional));
    navigate("/public/select-date");
  };

  return (
    <>
      <Typography variant="h5" mb={3}>
        ¿Con quién quieres atenderte para: {selectedService.name}?
      </Typography>

      <Grid container spacing={2}>
        {professionals.map((p) => (
          <Grid item xs={12} md={4} key={p.id}>
            <Card>
              <CardActionArea onClick={() => handleSelect(p)}>
                <CardContent>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2">
                    Profesional del centro
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}