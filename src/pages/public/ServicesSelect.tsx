import { Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";
import { services } from "../../data/services";
import { useNavigate } from "react-router-dom";

export default function ServicesSelect() {
  const navigate = useNavigate();

  const handleSelect = (service: any) => {
    localStorage.setItem("selectedService", JSON.stringify(service));
    navigate("/public/professionals");
  };

  return (
    <>
      <Typography variant="h5" mb={3}>¿Qué servicio necesitas?</Typography>

      <Grid container spacing={2}>
        {services.map((s: any) => (
          <Grid item xs={12} md={4} key={s.id}>
            <Card>
              <CardActionArea onClick={() => handleSelect(s)}>
                <CardContent>
                  <Typography variant="h6">{s.name}</Typography>
                  <Typography variant="body2">
                    Duración aprox: {s.duration} min
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