import { useState, useEffect } from "react";
import { 
  Box, 
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  MenuItem,
  Container,
  Paper,
  Stack,
  InputAdornment,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from "@mui/material";
import { 
  Email as EmailIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/apiClient";

interface Specialty {
  id: number;
  name: string;
  duration: number;
  price: number;
  color?: string;
}

interface Professional {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialties: Specialty[];
}

const ITEMS_PER_PAGE = 4;

export default function Profesionales() {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | "all">("all");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog para seleccionar especialidad
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, professionals]);

  const fetchData = async () => {
    try {
      const profResponse = await api.get("/professionals");
      const allProfs: Professional[] = profResponse.data;
      
      const profsWithSpecialties = allProfs.filter(
        prof => prof.specialties && prof.specialties.length > 0
      );
      
      setProfessionals(profsWithSpecialties);

      const specialtiesSet = new Set<string>();
      const specialtiesMap = new Map<number, Specialty>();
      
      profsWithSpecialties.forEach(prof => {
        prof.specialties?.forEach(spec => {
          if (!specialtiesSet.has(spec.name)) {
            specialtiesSet.add(spec.name);
            specialtiesMap.set(spec.id, spec);
          }
        });
      });
      
      setAllSpecialties(Array.from(specialtiesMap.values()));
    } catch (err: any) {
      setError(err.message || "Error al cargar profesionales");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...professionals];

    if (searchTerm) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(prof =>
        prof.specialties?.some(spec => spec.id === selectedSpecialty)
      );
    }

    setFilteredProfessionals(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleReserve = (professional: Professional) => {
    if (professional.specialties.length === 1) {
      // Si tiene una sola especialidad, ir directo a selección de fecha
      navigateToDateSelect(professional, professional.specialties[0]);
    } else {
      // Si tiene múltiples especialidades, abrir dialog
      setSelectedProfessional(professional);
      setDialogOpen(true);
    }
  };

  const handleSpecialtySelect = (specialty: Specialty) => {
    if (selectedProfessional) {
      navigateToDateSelect(selectedProfessional, specialty);
    }
    setDialogOpen(false);
  };

  const navigateToDateSelect = (professional: Professional, specialty: Specialty) => {
    navigate('/centro-de-salud-cuad/public/select-date', {
      state: {
        specialty,
        professional: {
          id: professional.id,
          name: professional.name,
          schedule: {}
        }
      }
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProfessional(null);
  };

  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfessionals = filteredProfessionals.slice(startIndex, endIndex);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Nuestro Equipo Profesional
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Conoce a los profesionales especializados que te atenderán
        </Typography>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2}
          alignItems="center"
        >
          <TextField
            fullWidth
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { md: 400 } }}
          />

          <TextField
            select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value === "all" ? "all" : Number(e.target.value))}
            size="small"
            sx={{ minWidth: { xs: '100%', md: 250 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">Todas las especialidades</MenuItem>
            {allSpecialties.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                {specialty.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProfessionals.length)} de {filteredProfessionals.length} profesionales
          </Typography>
        </Box>
      </Paper>

      {/* Listado de profesionales */}
      {filteredProfessionals.length === 0 ? (
        <Alert severity="info">
          {searchTerm || selectedSpecialty !== "all" 
            ? "No se encontraron profesionales con los filtros seleccionados."
            : "No hay profesionales con especialidades asignadas en este momento."}
        </Alert>
      ) : (
        <>
          <Stack spacing={2}>
            {currentProfessionals.map((professional) => (
              <Paper 
                key={professional.id}
                elevation={2}
                sx={{ 
                  p: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateX(4px)"
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  {/* Avatar */}
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: "primary.main",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}
                  >
                    {getInitials(professional.name)}
                  </Avatar>

                  {/* Contenido principal */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {professional.name}
                    </Typography>

                    {/* Información de contacto */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={{ xs: 0.5, sm: 2 }} 
                      sx={{ mb: 1.5 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EmailIcon fontSize="small" sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {professional.email}
                        </Typography>
                      </Box>

                      {professional.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PhoneIcon fontSize="small" sx={{ fontSize: 16 }} color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {professional.phone}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Especialidades */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <MedicalIcon fontSize="small" sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Especialidades
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {professional.specialties.map((specialty) => (
                          <Chip
                            key={specialty.id}
                            label={specialty.name}
                            size="small"
                            sx={{
                              height: 24,
                              bgcolor: 'action.hover',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              '&:hover': {
                                bgcolor: 'action.selected'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Botón de reserva */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<CalendarIcon />}
                      onClick={() => handleReserve(professional)}
                      sx={{
                        minWidth: 150,
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Reservar Hora
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog para seleccionar especialidad */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Selecciona una Especialidad
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProfessional?.name} tiene múltiples especialidades
          </Typography>
          <List sx={{ pt: 0 }}>
            {selectedProfessional?.specialties.map((specialty) => (
              <ListItem key={specialty.id} disablePadding>
                <ListItemButton 
                  onClick={() => handleSpecialtySelect(specialty)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <MedicalIcon sx={{ mr: 2 }} color="primary" />
                  <ListItemText 
                    primary={specialty.name}
                    secondary={`${specialty.duration} minutos - $${specialty.price.toLocaleString('es-CL')}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Información de contacto */}
      <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ¿Necesitas más información? Contáctanos al <strong>+56 9 1234 5678</strong>
        </Typography>
      </Paper>
    </Container>
  );
}