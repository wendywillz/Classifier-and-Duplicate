type DateLike = number | string | Date;
interface Transaction {
  id: number;
  sourceAccount: string;
  targetAccount: string;
  amount: number;
  category: string;
  time: string;
}

const millisecondsInMinute: number = 60000;

function differenceInMilliseconds(dateLeft: DateLike, dateRight: DateLike): number {
  return new Date(dateLeft).getTime() - new Date(dateRight).getTime();
}

function isWithinDuplicateWindow(dateLeft: DateLike, dateRight: DateLike): boolean {
  return (
    Math.abs(differenceInMilliseconds(dateLeft, dateRight)) <=
    millisecondsInMinute
  );
}

function getTransactionHash(transaction: Transaction): string {
  const { sourceAccount, targetAccount, amount, category } = transaction;
  return `${sourceAccount}-${targetAccount}-${amount}-${category}`;
}

function findDuplicateTransactions(
  transactions: Transaction[]
): Transaction[][] {
  if (!Array.isArray(transactions)) {
    throw new TypeError('Transactions must be an array');
  }

  const uniqueTransactionHashes: Set<string> = new Set();
  transactions.forEach((transaction) => {
    const hash = getTransactionHash(transaction);
    uniqueTransactionHashes.add(hash);
  });

  const duplicateTransactionGroups: Transaction[][] = [];
  Array.from(uniqueTransactionHashes).forEach((uniqueTransactionHash) => {
    const candidateTransactions = transactions.filter((transaction) => {
      return getTransactionHash(transaction) === uniqueTransactionHash;
    });

    if (candidateTransactions.length < 2) {
      return;
    }

    candidateTransactions.sort((first, second) => {
      const firstTransactionTime = new Date(first.time).getTime();
      const secondTransactionTime = new Date(second.time).getTime();
      if (firstTransactionTime > secondTransactionTime) {
        return 1;
      }
      if (firstTransactionTime < secondTransactionTime) {
        return -1;
      }
      return 0;
    });

    const duplicateTransactions: Transaction[] = [];
    for (let index = 0; index < candidateTransactions.length; index++) {
      const currentTransaction = candidateTransactions[index];
      const previousTransaction = candidateTransactions[index - 1];
      const nextTransaction = candidateTransactions[index + 1];
      let withinDuplicateWindow = false;

      if (index === 0) {
        withinDuplicateWindow = isWithinDuplicateWindow(
          nextTransaction.time,
          currentTransaction.time
        );
      } else if (index === candidateTransactions.length - 1) {
        withinDuplicateWindow = isWithinDuplicateWindow(
          currentTransaction.time,
          previousTransaction.time
        );
      } else {
        const withinWindowForPreviousTransaction = isWithinDuplicateWindow(
          currentTransaction.time,
          previousTransaction.time
        );
        const withinWindowForNextTransaction = isWithinDuplicateWindow(
          nextTransaction.time,
          currentTransaction.time
        );
        withinDuplicateWindow =
          withinWindowForPreviousTransaction || withinWindowForNextTransaction;
      }

      if (withinDuplicateWindow) {
        duplicateTransactions.push(currentTransaction);
      }
    }

    if (duplicateTransactions.length > 0) {
      duplicateTransactionGroups.push(duplicateTransactions);
    }
  });

  duplicateTransactionGroups.sort((first, second) => {
    const firstTransactionTime = new Date(first[0].time).getTime();
    const secondTransactionTime = new Date(second[0].time).getTime();

    if (firstTransactionTime > secondTransactionTime) {
      return 1;
    }

    if (firstTransactionTime < secondTransactionTime) {
      return -1;
    }

    return 0;
  });

  return duplicateTransactionGroups;
}

export default findDuplicateTransactions;
