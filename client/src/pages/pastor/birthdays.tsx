import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cake, Heart, Calendar, Download, User, Info } from "lucide-react";
import type { Member } from "@shared/schema";

// Tipos auxiliares
type BirthdayMember = {
  id: string;
  fullName: string;
  birthDate: string;
  dayOfWeek: string;
  formattedDate: string;
  age: number;
};

type AnniversaryMember = {
  id: string;
  fullName: string;
  marriageDate: string;
  dayOfWeek: string;
  formattedDate: string;
  yearsMarried: number;
};

export default function PastorBirthdaysPage() {
  const [activeTab, setActiveTab] = useState<"birthdays" | "anniversaries">("birthdays");

  // Buscar todos os membros ativos
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Função para obter data de hoje
  const today = new Date();
  const currentYear = today.getFullYear();

  // Função para obter início e fim da semana
  const getWeekRange = () => {
    const dayOfWeek = today.getDay(); // 0 = domingo, 6 = sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Volta para domingo
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Avança para sábado
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange();

  // Função para verificar se data está na semana (suporta virada de ano)
  const isDateInCurrentWeek = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    const [, month, day] = dateStr.split('-').map(Number);
    
    // Para cada dia da semana, verificar se corresponde
    for (let i = 0; i <= 6; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      
      if (checkDate.getMonth() + 1 === month && checkDate.getDate() === day) {
        return true;
      }
    }
    
    return false;
  };

  // Calcular idade
  const calculateAge = (birthDateStr: string): number => {
    const [year, month, day] = birthDateStr.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    let age = currentYear - year;
    const birthdayThisYear = new Date(currentYear, month - 1, day);
    if (today < birthdayThisYear) age--;
    return age;
  };

  // Calcular anos de casamento
  const calculateYearsMarried = (marriageDateStr: string): number => {
    const [year, month, day] = marriageDateStr.split('-').map(Number);
    const marriageDate = new Date(year, month - 1, day);
    let years = currentYear - year;
    const anniversaryThisYear = new Date(currentYear, month - 1, day);
    if (today < anniversaryThisYear) years--;
    return years;
  };

  // Formatar data legível
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(currentYear, month - 1, day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  // Obter dia da semana
  const getDayOfWeek = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(currentYear, month - 1, day);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  };

  // Gerar lista de aniversariantes da semana
  const birthdayMembers = useMemo<BirthdayMember[]>(() => {
    if (!members) return [];
    
    return members
      .filter(member => member.memberStatus === "ativo" && member.birthDate)
      .filter(member => isDateInCurrentWeek(member.birthDate))
      .map(member => ({
        id: member.id,
        fullName: member.fullName,
        birthDate: member.birthDate,
        dayOfWeek: getDayOfWeek(member.birthDate),
        formattedDate: formatDate(member.birthDate),
        age: calculateAge(member.birthDate),
      }))
      .sort((a, b) => {
        const [, monthA, dayA] = a.birthDate.split('-').map(Number);
        const [, monthB, dayB] = b.birthDate.split('-').map(Number);
        const dateA = new Date(currentYear, monthA - 1, dayA);
        const dateB = new Date(currentYear, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
  }, [members]);

  // Gerar lista de aniversários de casamento da semana
  const anniversaryMembers = useMemo<AnniversaryMember[]>(() => {
    if (!members) return [];
    
    return members
      .filter(member => 
        member.memberStatus === "ativo" && 
        member.maritalStatus === "casado" && 
        member.marriageDate
      )
      .filter(member => isDateInCurrentWeek(member.marriageDate!))
      .map(member => ({
        id: member.id,
        fullName: member.fullName,
        marriageDate: member.marriageDate!,
        dayOfWeek: getDayOfWeek(member.marriageDate!),
        formattedDate: formatDate(member.marriageDate!),
        yearsMarried: calculateYearsMarried(member.marriageDate!),
      }))
      .sort((a, b) => {
        const [, monthA, dayA] = a.marriageDate.split('-').map(Number);
        const [, monthB, dayB] = b.marriageDate.split('-').map(Number);
        const dateA = new Date(currentYear, monthA - 1, dayA);
        const dateB = new Date(currentYear, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
  }, [members]);

  // Exportar lista de aniversariantes
  const exportBirthdays = () => {
    let content = "ANIVERSARIANTES DA SEMANA\n";
    content += `Período: ${startOfWeek.toLocaleDateString('pt-BR')} a ${endOfWeek.toLocaleDateString('pt-BR')}\n\n`;
    
    if (birthdayMembers.length > 0) {
      content += "=== ANIVERSÁRIOS ===\n";
      birthdayMembers.forEach(member => {
        content += `${member.dayOfWeek}, ${member.formattedDate} - ${member.fullName} (${member.age} anos)\n`;
      });
      content += "\n";
    }
    
    if (anniversaryMembers.length > 0) {
      content += "=== ANIVERSÁRIOS DE CASAMENTO ===\n";
      anniversaryMembers.forEach(member => {
        content += `${member.dayOfWeek}, ${member.formattedDate} - ${member.fullName} (${member.yearsMarried} anos)\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aniversariantes_${today.toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Aniversariantes</h1>
          <p className="text-muted-foreground mt-1">
            Aniversários e bodas da semana (geração automática)
          </p>
        </div>
        <Button 
          onClick={exportBirthdays}
          data-testid="button-export"
          disabled={birthdayMembers.length === 0 && anniversaryMembers.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Lista
        </Button>
      </div>

      {/* Alert informativo */}
      <Alert data-testid="alert-automatic">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Geração Automática:</strong> Esta página identifica automaticamente os aniversariantes da semana 
          atual ({startOfWeek.toLocaleDateString('pt-BR')} a {endOfWeek.toLocaleDateString('pt-BR')}) 
          baseado nas datas de nascimento e casamento dos membros ativos.
        </AlertDescription>
      </Alert>

      {/* Tabs: Aniversários vs Bodas */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="birthdays" data-testid="tab-birthdays">
            <Cake className="h-4 w-4 mr-2" />
            Aniversários ({birthdayMembers.length})
          </TabsTrigger>
          <TabsTrigger value="anniversaries" data-testid="tab-anniversaries">
            <Heart className="h-4 w-4 mr-2" />
            Bodas ({anniversaryMembers.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Aniversários */}
        <TabsContent value="birthdays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="h-5 w-5" />
                Aniversariantes da Semana
              </CardTitle>
              <CardDescription>
                {birthdayMembers.length} aniversariante{birthdayMembers.length !== 1 ? 's' : ''} esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {birthdayMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Cake className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum aniversariante esta semana</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dia</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Idade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {birthdayMembers.map((member) => (
                        <TableRow key={member.id} data-testid={`row-birthday-${member.id}`}>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-day-${member.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {member.dayOfWeek}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.formattedDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {member.fullName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {member.age} anos
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Aniversários de Casamento */}
        <TabsContent value="anniversaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Aniversários de Casamento da Semana
              </CardTitle>
              <CardDescription>
                {anniversaryMembers.length} boda{anniversaryMembers.length !== 1 ? 's' : ''} esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anniversaryMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum aniversário de casamento esta semana</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dia</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Casal</TableHead>
                        <TableHead>Anos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anniversaryMembers.map((member) => (
                        <TableRow key={member.id} data-testid={`row-anniversary-${member.id}`}>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-day-ann-${member.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {member.dayOfWeek}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.formattedDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-muted-foreground" />
                              <span>{member.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {member.yearsMarried} anos
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
