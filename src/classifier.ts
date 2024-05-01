interface Student {
  name: string;
  dob: string;
  regNo: string;
}

interface GroupMember {
  name: string;
  age: number;
  regNo: string;
}

interface Group {
  members: GroupMember[];
  oldest: number;
  sum: number;
  regNos: number[];
}

interface Output {
  noOfGroups: number;
  [key: string]: Group | number;
}

function classifier(input: Student[]): Output {
  const inputDeepCopy: Student[] = JSON.parse(JSON.stringify(input));

  function calculateAge(dob: string): number {
    const currentDate: Date = new Date("2019-01-01");
    const birthDate: Date = new Date(dob);
    return currentDate.getFullYear() - birthDate.getFullYear();
  }

  const sortedStudents: Student[] = inputDeepCopy.sort((a, b) => {
    const ageA: number = calculateAge(a.dob);
    const ageB: number = calculateAge(b.dob);
    return ageA - ageB;
  });

  const groups: Group[] = [];
  let currentGroup: GroupMember[] = [];

  sortedStudents.forEach((student, index) => {
    const age: number = calculateAge(student.dob);

    if (
      currentGroup.length < 3 &&
      !currentGroup.some(
        (member) => Math.abs(age - member.age) > 5
      )
    ) {
      currentGroup.push({ name: student.name, age, regNo: student.regNo });
    } else {
      groups.push({
        members: currentGroup,
        oldest: Math.max(...currentGroup.map((member) => member.age)),
        sum: currentGroup.reduce((acc, member) => acc + member.age, 0),
        regNos: currentGroup.map((member) => parseInt(member.regNo)).sort((a, b) => a - b)
      });
      currentGroup = [{ name: student.name, age, regNo: student.regNo }];
    }

    if (index === sortedStudents.length - 1 && currentGroup.length > 0) {
      groups.push({
        members: currentGroup,
        oldest: Math.max(...currentGroup.map((member) => member.age)),
        sum: currentGroup.reduce((acc, member) => acc + member.age, 0),
        regNos: currentGroup.map((member) => parseInt(member.regNo)).sort((a, b) => a - b)
      });
    }
  });

  const output: Output = {
    noOfGroups: groups.length,
  };

  groups.forEach((group, index) => {
    output[`group${index + 1}`] = group;
  });

  return output;
}

export default classifier;
